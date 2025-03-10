import { MCPServer, MCPTool } from '@types'
import log from 'electron-log'
import { EventEmitter } from 'events'
import { v4 as uuidv4 } from 'uuid'

import { windowService } from './WindowService'

export default class MCPService extends EventEmitter {
  private servers: MCPServer[] = []
  private activeServers: Map<string, any> = new Map()
  private clients: { [key: string]: any } = {}
  private Client: any
  private stoioTransport: any
  private sseTransport: any
  private initialized = false
  private initPromise: Promise<void> | null = null
  private serversLoaded = false
  private serversLoadedPromise: Promise<void> | null = null
  private serversLoadedResolve: (() => void) | null = null

  constructor() {
    super()

    // Create a promise that will be resolved when servers are loaded from Redux
    this.serversLoadedPromise = new Promise((resolve) => {
      this.serversLoadedResolve = resolve
    })

    // Request servers from Redux on initialization
    this.requestServers()
  }

  /**
   * Request server data from renderer process Redux
   */
  public requestServers(): void {
    const mainWindow = windowService.getMainWindow()
    if (mainWindow) {
      log.info('[MCP] Requesting servers from Redux')
      mainWindow.webContents.send('mcp:request-servers')
    } else {
      log.warn('[MCP] Main window not available, cannot request servers')
    }
  }

  /**
   * Set servers received from Redux
   */
  public setServers(servers: MCPServer[]): void {
    log.info(`[MCP] Received ${servers.length} servers from Redux`)
    this.servers = servers
    this.serversLoaded = true

    // Resolve the promise to unlock initialization
    if (this.serversLoadedResolve) {
      this.serversLoadedResolve()
      this.serversLoadedResolve = null
    }

    // Initialize if not already initialized
    if (!this.initialized) {
      this.init().catch((err) => {
        log.error('[MCP] Failed to initialize MCP service:', err)
      })
    }
  }

  /**
   * Get the current servers
   */
  private getServers(): MCPServer[] {
    return this.servers
  }

  /**
   * Wait for servers to be loaded from Redux
   */
  private async waitForServers(): Promise<void> {
    if (!this.serversLoaded && this.serversLoadedPromise) {
      log.info('[MCP] Waiting for servers data from Redux...')
      await this.serversLoadedPromise
      log.info('[MCP] Servers received, continuing initialization')
    }
  }

  public async init() {
    // If already initialized, return immediately
    if (this.initialized) return

    // If initialization is in progress, return that promise
    if (this.initPromise) return this.initPromise

    // Create and store the initialization promise
    this.initPromise = (async () => {
      try {
        // Wait for servers to be loaded from Redux
        await this.waitForServers()

        log.info('[MCP] Starting initialization')
        this.Client = await this.importClient()
        this.stoioTransport = await this.importStdioClientTransport()
        this.sseTransport = await this.importSSEClientTransport()

        // Mark as initialized before loading servers to prevent recursive initialization
        this.initialized = true

        await this.load(this.getServers())
        log.info('[MCP] Initialization completed successfully')
      } catch (err) {
        this.initialized = false // Reset flag on error
        log.error('[MCP] Failed to initialize:', err)
        throw err
      } finally {
        this.initPromise = null
      }
    })()

    return this.initPromise
  }

  private async importClient() {
    try {
      const { Client } = await import('@modelcontextprotocol/sdk/client/index.js')
      return Client
    } catch (err) {
      log.error('[MCP] Failed to import Client:', err)
      throw err
    }
  }

  private async importStdioClientTransport() {
    try {
      const { StdioClientTransport } = await import('@modelcontextprotocol/sdk/client/stdio.js')
      return StdioClientTransport
    } catch (err) {
      log.error('[MCP] Failed to import Transport:', err)
      throw err
    }
  }

  private async importSSEClientTransport() {
    try {
      const { SSEClientTransport } = await import('@modelcontextprotocol/sdk/client/sse.js')
      return SSEClientTransport
    } catch (err) {
      log.error('[MCP] Failed to import Transport:', err)
      throw err
    }
  }

  public async listAvailableServices(): Promise<MCPServer[]> {
    await this.ensureInitialized()
    return this.getServers()
  }

  private async ensureInitialized() {
    if (!this.initialized) {
      log.debug('[MCP] Ensuring initialization')
      await this.init()
    }
  }

  public async addServer(server: MCPServer): Promise<void> {
    await this.ensureInitialized()
    try {
      const servers = this.getServers()
      if (servers.some((s) => s.name === server.name)) {
        throw new Error(`Server with name ${server.name} already exists`)
      }

      servers.push(server)
      this.notifyReduxServersChanged(servers)

      if (server.isActive) {
        await this.activate(server)
      }
    } catch (error) {
      log.error('Failed to add MCP server:', error)
      throw error
    }
  }

  public async updateServer(server: MCPServer): Promise<void> {
    await this.ensureInitialized()
    try {
      const servers = this.getServers()
      const index = servers.findIndex((s) => s.name === server.name)

      if (index === -1) {
        throw new Error(`Server ${server.name} not found`)
      }

      const wasActive = servers[index].isActive
      if (wasActive && !server.isActive) {
        await this.deactivate(server.name)
      } else if (!wasActive && server.isActive) {
        await this.activate(server)
      }

      servers[index] = server
      this.notifyReduxServersChanged(servers)
    } catch (error) {
      log.error('Failed to update MCP server:', error)
      throw error
    }
  }

  public async deleteServer(serverName: string): Promise<void> {
    await this.ensureInitialized()
    try {
      if (this.clients[serverName]) {
        await this.deactivate(serverName)
      }

      const servers = this.getServers()
      const filteredServers = servers.filter((s) => s.name !== serverName)
      this.servers = filteredServers
      this.notifyReduxServersChanged(filteredServers)
    } catch (error) {
      log.error('Failed to delete MCP server:', error)
      throw error
    }
  }

  public async setServerActive(params: { name: string; isActive: boolean }): Promise<void> {
    await this.ensureInitialized()
    try {
      const { name, isActive } = params
      const servers = this.getServers()
      const server = servers.find((s) => s.name === name)

      if (!server) {
        throw new Error(`Server ${name} not found`)
      }

      server.isActive = isActive
      this.notifyReduxServersChanged(servers)

      if (isActive) {
        await this.activate(server)
      } else {
        await this.deactivate(name)
      }
    } catch (error) {
      log.error('Failed to set MCP server active status:', error)
      throw error
    }
  }

  /**
   * Notify Redux in the renderer process about server changes
   */
  private notifyReduxServersChanged(servers: MCPServer[]): void {
    const mainWindow = windowService.getMainWindow()
    if (mainWindow) {
      mainWindow.webContents.send('mcp:servers-changed', servers)
    }
  }

  public async activate(server: MCPServer): Promise<void> {
    await this.ensureInitialized()
    try {
      const { name, baseUrl, command, args, env } = server

      if (this.clients[name]) {
        log.info(`[MCP] Server ${name} is already running`)
        return
      }

      let transport: any = null

      if (baseUrl) {
        transport = new this.sseTransport(new URL(baseUrl))
      } else if (command) {
        let cmd: string = command
        if (command === 'npx') {
          cmd = process.platform === 'win32' ? `${command}.cmd` : command
        }

        const mergedEnv = {
          ...env,
          PATH: process.env.PATH
        }

        transport = new this.stoioTransport({
          command: cmd,
          args,
          stderr: process.platform === 'win32' ? 'pipe' : 'inherit',
          env: mergedEnv
        })
      } else {
        throw new Error('Either baseUrl or command must be provided')
      }

      const client = new this.Client(
        {
          name: name,
          version: '1.0.0'
        },
        {
          capabilities: {}
        }
      )

      await client.connect(transport)
      this.clients[name] = client
      this.activeServers.set(name, { client, server })

      log.info(`[MCP] Server ${name} started successfully`)
      this.emit('server-started', { name })
    } catch (error) {
      log.error('[MCP] Error activating server:', error)
      throw error
    }
  }

  public async deactivate(name: string): Promise<void> {
    await this.ensureInitialized()
    try {
      if (this.clients[name]) {
        log.info(`[MCP] Stopping server: ${name}`)
        await this.clients[name].close()
        delete this.clients[name]
        this.activeServers.delete(name)
        this.emit('server-stopped', { name })
      } else {
        log.warn(`[MCP] Server ${name} is not running`)
      }
    } catch (error) {
      log.error('[MCP] Error deactivating server:', error)
      throw error
    }
  }

  public async listTools(serverName?: string): Promise<MCPTool[]> {
    await this.ensureInitialized()
    try {
      if (serverName) {
        if (!this.clients[serverName]) {
          throw new Error(`MCP Client ${serverName} not found`)
        }
        const { tools } = await this.clients[serverName].listTools()
        return tools.map((tool: any) => {
          tool.serverName = serverName
          tool.id = 'f' + uuidv4().replace(/-/g, '')
          return tool
        })
      } else {
        let allTools: MCPTool[] = []
        for (const clientName in this.clients) {
          try {
            const { tools } = await this.clients[clientName].listTools()
            log.info(`[MCP] Tools for ${clientName}:`, tools)
            allTools = allTools.concat(
              tools.map((tool: MCPTool) => {
                tool.serverName = clientName
                tool.id = 'f' + uuidv4().replace(/-/g, '')
                return tool
              })
            )
          } catch (error) {
            log.error(`[MCP] Error listing tools for ${clientName}:`, error)
          }
        }
        log.info(`[MCP] Total tools listed: ${allTools.length}`)
        return allTools
      }
    } catch (error) {
      log.error('[MCP] Error listing tools:', error)
      return []
    }
  }

  public async callTool(params: { client: string; name: string; args: any }): Promise<any> {
    await this.ensureInitialized()
    try {
      const { client, name, args } = params
      if (!this.clients[client]) {
        throw new Error(`MCP Client ${client} not found`)
      }

      log.info('[MCP] Calling:', client, name, args)
      const result = await this.clients[client].callTool({
        name,
        arguments: args
      })
      return result
    } catch (error) {
      log.error(`[MCP] Error calling tool ${params.name} on ${params.client}:`, error)
      throw error
    }
  }

  public async cleanup(): Promise<void> {
    try {
      for (const name in this.clients) {
        await this.deactivate(name).catch((err) => {
          log.error(`[MCP] Error during cleanup of ${name}:`, err)
        })
      }
      this.clients = {}
      this.activeServers.clear()
      log.info('[MCP] All servers cleaned up')
    } catch (error) {
      log.error('[MCP] Failed to clean up servers:', error)
      throw error
    }
  }

  public async load(servers: MCPServer[]): Promise<void> {
    log.info(`[MCP] Loading ${servers.length} servers`)

    const activeServers = servers.filter((server) => server.isActive)

    if (activeServers.length === 0) {
      log.info('[MCP] No active servers to load')
      return
    }

    for (const server of activeServers) {
      log.info(`[MCP] Activating server: ${server.name}`)
      try {
        await this.activate(server)
        log.info(`[MCP] Successfully activated server: ${server.name}`)
      } catch (error) {
        log.error(`[MCP] Failed to activate server ${server.name}:`, error)
        this.emit('server-error', { name: server.name, error })
      }
    }

    log.info(`[MCP] Loaded and activated ${Object.keys(this.clients).length} servers`)
  }
}
