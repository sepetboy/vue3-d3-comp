import installer from './defaults'
export * from './make-installer'
export * from '../components'
export * from '../constants'
export * from '../hooks'

export const install = installer.install
export const version = installer.version
export default installer