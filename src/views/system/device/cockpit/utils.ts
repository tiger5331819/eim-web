export const formatNumber = (num: number) => {
  return num.toFixed().replace(/(?!^)(?=(\d{3})+$)/g, ',')
}
