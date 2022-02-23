import axios from 'axios'
import Moralis from 'moralis/dist/moralis.min.js'
import { COLLECTIONS, METADATA_URL, IMAGE_URL } from '@/utils/constants'

class NFTService {
  async getNFTs(collectionId) {
    const NFTs = {}

    const { data: metadata } = await this.getMetadata(collectionId)

    metadata.forEach(data => {
      const { name, edition, attributes } = data
      const tokenId = edition

      NFTs[tokenId] = {
        token_id: tokenId,
        name: name,
        image_url: `${IMAGE_URL}/${collectionId}/${tokenId}.png`,
        attributes: attributes
      }
    })

    return NFTs
  }

  async getUserNFTTokenIds(collectionId, address) {
    const currentPage = 1
    const offset = currentPage - 1
    const perPage = 20

    const { total, result: NFTs } = await this.getNFTsForContract(
      collectionId,
      address,
      offset,
      perPage
    )

    const paginatedUserNFTs = await this.getPaginatedUserNFTs(
      collectionId,
      address,
      currentPage,
      total,
      perPage
    )

    const userNFTs = NFTs.concat(...paginatedUserNFTs)

    return userNFTs.map(NFT => Number.parseInt(NFT.token_id))
  }

  async getPaginatedUserNFTs(
    collectionId,
    address,
    currentPage,
    total,
    perPage
  ) {
    const lastPage = Math.ceil(total / perPage)
    const paginatedUserNFTs = []

    for (let page = currentPage + 1; page <= lastPage; page++) {
      const offset = (page - 1) * perPage

      const { result: NFTs } = await this.getNFTsForContract(
        collectionId,
        address,
        offset,
        perPage
      )

      paginatedUserNFTs.push(NFTs)
    }

    return paginatedUserNFTs
  }

  async getNFTsForContract(collectionId, address, offset = 0, limit = 500) {
    return Moralis.Web3API.account.getNFTsForContract({
      chain: 'matic',
      address: address,
      token_address: this.getContractAddress(collectionId),
      offset: offset,
      limit: limit
    })
  }

  async getMetadata(collectionId) {
    return axios.get(`${METADATA_URL}/${collectionId}/index.json`)
  }

  getContractAddress(collectionId) {
    return COLLECTIONS[collectionId].contract_address
  }
}

export default new NFTService()
