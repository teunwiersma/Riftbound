import { CatalogData, catalogData } from "@/api/data/catalog"
import { useEffect, useState } from "react"

export function useCatalogData(): CatalogData {
  const [cardsData, setCardsData] = useState<CatalogData>();

  useEffect(() => {
    async function getCatalogData() {
      const { data } = await catalogData();

      setCardsData(data)
    }

    getCatalogData()
  }, [])

  if (!cardsData || cardsData.error) {
    return {
      data: null,
      error: cardsData?.error || 'Teun heeft het verneukt',
    }
  }

  return {
    data: cardsData.data,
    error: null,
  }
}
