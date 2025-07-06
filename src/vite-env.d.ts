/// <reference types="vite/client" />

declare module '*.csv' {
  const content: any[]
  export default content
}