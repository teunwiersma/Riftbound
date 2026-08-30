import * as data from "../../riftbound_cards.json";

export const catalogData = () => {
  const { data } = getCatalogData();

  return {
    // TODO: remove when we dont make unnecessary calls
    data: data.slice(0, 10),
    loading: false,
    error: null,
  };
}

const getCatalogData = () => {
  return {
    data: data.sets.flatMap(item => item.cards)
  };
}
