const patents = [
  'CN118939106A',
  'CN118939105A',
  'WO2023143051A1',
  'CN118535001A',
  'CN113504832A',
  'CN117635879A',
  'CN117376625A',
  'CN117676261A',
].map((number) => ({
  number,
  url: `https://patents.google.com/patent/${number}`,
}));

export default patents;
