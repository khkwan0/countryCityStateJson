import TrieSearch from 'trie-search'

declare module 'trie-search' {
  export default class TrieSearch {
    constructor(keys?: string[], options?: { min?: number, splitOnRegEx?: boolean })
    map(key: string, value: any): void
    search(key: string): any[]
  }
} 