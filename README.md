# Bankin_challenge
A Scrapping Script for the website https://web.bankin.com/challenge/index.html in a very optimized time


Prequisities: 
- NodeJs
- puppeteer
- chrome headless

**Run** : 
node index.js

**Output :** 

JSON file containing all the transactions(4999).

**Techniques/tricks used**
- ususal scrapping with dismissing alert errors
- forcing the page to generate all the results without reloading
- bypassing the artificial timeout
- Getting the transactions without expicitly selecting them from HTML (rendering time and selector time optimized)
  |-> how : modifying Jquery append to get me all the data without rendering.
  
  
**Detailed timing : in my computer**
- Pupeteer loading process: 467.546ms
- Page loading: 296.337ms
- Pure scrapping time: 485.753ms
- The whole execution time: 1250.229ms
