import type { ExecutableSubmodule, ServerSubmodule } from "./types"

const defaultSubmodule = {
  async init() {
    return {}
  },

  async createConfig() {
    return {}
  },

  async createServices() {
    return {}
  },

  async loadRouteModule() {
    return undefined
  },

  async loadRouteModules() {
    return {}
  },

  /** Best effort to figure out what is the handle */
  async createRoute() {
    return undefined
  },

  async createRouter({ routes }) {
    return routes
  },

  async execute() {
    throw new Error('not yet implemented')
  },

  async serve() {
    throw new Error('not yet implemented')
  },

  async createInnerClient({ startPromise }) {
    await startPromise
    return () => { throw new Error('not yet implemented') }
  }

} satisfies ExecutableSubmodule & ServerSubmodule

export { defaultSubmodule }