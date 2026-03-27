export const FilesSizeCalc = (data) => {
  if (data > 1024 * 1024) {
    data = (data / 1024 / 1024).toFixed(2) + 'M'
  } else {
    data = (data / 1024).toFixed(2) + 'K'
  }
  return data
}
