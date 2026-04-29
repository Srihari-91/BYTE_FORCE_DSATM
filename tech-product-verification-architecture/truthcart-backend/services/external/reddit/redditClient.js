// Mock Reddit Data Store
// Realistic simulated dataset of r/gadgets, r/Android, r/laptops posts
// Used when Reddit API is not available or for development

const MOCK_REDDIT_DATASET = [
  // Smartphone posts
  {
    id: 'r1', subreddit: 'Android', title: 'One month with the Pixel 9 Pro — battery life is disappointing',
    selftext: 'Been using the Pixel 9 Pro for a month now. The camera is amazing but battery barely lasts a day with moderate use. Getting around 4-5 hours SOT. The advertised "all-day battery" is a stretch for anyone who actually uses their phone.',
    score: 342, num_comments: 89, created_utc: Date.now() / 1000 - 86400 * 3,
    keywords: ['battery', 'pixel', 'battery life', 'disappointing']
  },
  {
    id: 'r2', subreddit: 'Android', title: 'Samsung S25 Ultra — the 200MP camera is mostly marketing',
    selftext: 'The 200MP mode takes forever to process and the files are huge. 99% of users will just use the default 12MP pixel-binned mode. The zoom is incredible though. Just don\'t buy it for the 200MP number.',
    score: 567, num_comments: 134, created_utc: Date.now() / 1000 - 86400 * 5,
    keywords: ['camera', '200mp', 'samsung', 'marketing', 'megapixel']
  },
  {
    id: 'r3', subreddit: 'gadgets', title: 'PSA: "Military-grade durability" doesn\'t mean what you think',
    selftext: 'MIL-STD-810G testing has many different test methods. A device might pass temperature testing but fail drop testing. "Military-grade" is a marketing term — always check which specific tests were passed.',
    score: 891, num_comments: 210, created_utc: Date.now() / 1000 - 86400 * 7,
    keywords: ['military-grade', 'durability', 'marketing', 'mil-std']
  },
  {
    id: 'r4', subreddit: 'Android', title: 'Fast charging claims are getting ridiculous',
    selftext: 'Saw a phone advertised with "120W fast charging". Reality: you need to buy a separate $50 charger, it only charges at 120W for the first 5 minutes, then drops to 45W due to heat. And forget about battery longevity at those speeds.',
    score: 445, num_comments: 167, created_utc: Date.now() / 1000 - 86400 * 4,
    keywords: ['fast charging', 'charging', 'battery', 'watt']
  },
  {
    id: 'r5', subreddit: 'gadgets', title: 'The "AI" features on most phones are just renamed software features from 5 years ago',
    selftext: 'Scene recognition? Had that since 2018. Voice assistants? Same. Photo enhancement? That\'s just filters with a new name. Real on-device AI/ML is still rare outside of flagship phones.',
    score: 723, num_comments: 245, created_utc: Date.now() / 1000 - 86400 * 2,
    keywords: ['ai', 'artificial intelligence', 'marketing', 'software']
  },
  {
    id: 'r6', subreddit: 'Android', title: 'Xiaomi 15 Pro heating issues during gaming',
    selftext: 'Great specs on paper but thermal throttling is real. After 20 minutes of Genshin Impact, performance drops by about 30%. The slim design looks nice but can\'t handle sustained gaming.',
    score: 234, num_comments: 78, created_utc: Date.now() / 1000 - 86400 * 6,
    keywords: ['heating', 'thermal', 'gaming', 'performance', 'throttling']
  },
  {
    id: 'r7', subreddit: 'gadgets', title: 'Sapphire glass vs Gorilla Glass — real world test results',
    selftext: 'Did some scratch tests. Sapphire is more scratch-resistant but shatters more easily on drops. Gorilla Glass Victus is better for overall protection. There\'s a reason most phones use Gorilla Glass.',
    score: 312, num_comments: 95, created_utc: Date.now() / 1000 - 86400 * 10,
    keywords: ['glass', 'sapphire', 'gorilla glass', 'durability', 'scratch']
  },
  {
    id: 'r8', subreddit: 'Android', title: 'OnePlus 13 — oxygenOS is becoming just another bloated skin',
    selftext: 'Remember when OxygenOS was "clean and bloat-free"? Now it\'s basically ColorOS with a different name. Pre-installed apps everywhere, aggressive background killing, ads in system apps.',
    score: 678, num_comments: 201, created_utc: Date.now() / 1000 - 86400 * 8,
    keywords: ['software', 'bloatware', 'oxygenos', 'skin', 'ads']
  },
  {
    id: 'r9', subreddit: 'Android', title: 'Water resistance ratings are misleading — my IP68 phone died after a pool photo',
    selftext: 'IP68 means tested in laboratory conditions with fresh water. Chlorinated pool water, salt water, or even moving water (like a shower) can still cause damage. The warranty doesn\'t cover water damage either.',
    score: 1023, num_comments: 312, created_utc: Date.now() / 1000 - 86400 * 1,
    keywords: ['water resistance', 'ip68', 'waterproof', 'warranty', 'damage']
  },

  // Laptop posts
  {
    id: 'r10', subreddit: 'laptops', title: 'MacBook Air M4 — "all-day battery" is actually true this time',
    selftext: 'I\'ve been getting 12-14 hours of real work (coding, browsing, documents). Apple\'s battery claims are surprisingly accurate for the M-series. First laptop where "all-day" isn\'t marketing fluff.',
    score: 456, num_comments: 123, created_utc: Date.now() / 1000 - 86400 * 3,
    keywords: ['battery', 'macbook', 'all-day', 'battery life']
  },
  {
    id: 'r11', subreddit: 'laptops', title: 'Gaming laptop with "RTX 4070" but it\'s the 45W version — performance is terrible',
    selftext: 'Check the TGP (Total Graphics Power) before buying any gaming laptop. A 45W RTX 4070 performs worse than a full-power RTX 4060. Manufacturers advertise the GPU name but hide the power limit.',
    score: 892, num_comments: 234, created_utc: Date.now() / 1000 - 86400 * 5,
    keywords: ['gpu', 'rtx', 'gaming', 'performance', 'power limit', 'tgp']
  },
  {
    id: 'r12', subreddit: 'laptops', title: 'Soldered RAM is a scam — can\'t upgrade my $1200 laptop',
    selftext: 'Bought a laptop with 8GB RAM thinking I could upgrade later. Found out it\'s soldered. Now stuck with 8GB in 2025. This should be illegal — or at least clearly disclosed.',
    score: 1567, num_comments: 345, created_utc: Date.now() / 1000 - 86400 * 4,
    keywords: ['ram', 'soldered', 'upgrade', 'repair', 'scam']
  },
  {
    id: 'r13', subreddit: 'laptops', title: 'Thin and light laptops — the thermal throttling reality',
    selftext: 'Thin laptops look great but check the sustained performance. Many "high performance" ultrabooks throttle to 50-60% of peak after 10 minutes of load. The Intel/AMD marketing numbers are only for burst performance.',
    score: 534, num_comments: 156, created_utc: Date.now() / 1000 - 86400 * 7,
    keywords: ['thermal', 'throttling', 'thin', 'slim', 'performance']
  },

  // Headphones/Audio
  {
    id: 'r14', subreddit: 'gadgets', title: 'ANC headphones — the battery life claims are tested at 50% volume',
    selftext: 'Most manufacturers test ANC battery life at 50% volume with ANC on. If you listen at higher volumes (which most people do), expect 20-30% less battery life than advertised.',
    score: 234, num_comments: 67, created_utc: Date.now() / 1000 - 86400 * 6,
    keywords: ['battery', 'headphones', 'anc', 'battery life', 'testing']
  },
  {
    id: 'r15', subreddit: 'gadgets', title: 'USB-C everything — except my new phone still needs dongles',
    selftext: 'No headphone jack on a $800 phone. Dongle quality varies wildly — the cheap ones ruin audio quality. Bluetooth latency makes gaming impossible. We traded convenience for... nothing.',
    score: 678, num_comments: 189, created_utc: Date.now() / 1000 - 86400 * 3,
    keywords: ['headphone jack', 'dongle', 'usb-c', 'audio', 'bluetooth']
  },

  // General tech
  {
    id: 'r16', subreddit: 'gadgets', title: 'Benchmark scores are meaningless without context',
    selftext: 'Saw a phone advertising "highest AnTuTu score". The test was run in a refrigerated room at 5°C. Real-world performance in a warm room or outdoors will be significantly lower due to thermal throttling.',
    score: 445, num_comments: 98, created_utc: Date.now() / 1000 - 86400 * 8,
    keywords: ['benchmark', 'antutu', 'testing', 'performance', 'throttling']
  },
  {
    id: 'r17', subreddit: 'gadgets', title: 'The "flagship killer" myth — you get what you pay for',
    selftext: 'Budget "flagship killers" cut corners somewhere: camera processing, build materials, software updates, or after-sales support. There\'s no magic — the cost savings come from somewhere.',
    score: 567, num_comments: 234, created_utc: Date.now() / 1000 - 86400 * 2,
    keywords: ['flagship', 'budget', 'compromise', 'value']
  },
  {
    id: 'r18', subreddit: 'Android', title: 'OxygenOS 15 — still waiting for the update promised 6 months ago',
    selftext: 'Bought this phone partly because of the "3 years of updates" promise. 6 months behind on security patches. Update promises mean nothing if the manufacturer doesn\'t deliver on time.',
    score: 345, num_comments: 89, created_utc: Date.now() / 1000 - 86400 * 1,
    keywords: ['updates', 'software', 'promise', 'security', 'delay']
  },
];

export default MOCK_REDDIT_DATASET;
