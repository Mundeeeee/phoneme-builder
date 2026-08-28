#!/bin/bash
# Run this against your deployed app to prove frontend <-> backend <-> DB
# are all connected. Replace BASE_URL with http://localhost:3000 (local)
# or http://<your-ec2-public-ip>:3000 (AWS).

BASE_URL="${1:-http://localhost:3000}"

echo "1) Health check (app + database):"
curl -s "$BASE_URL/health" | python3 -m json.tool
echo

echo "2) Create a word list via the API:"
LIST_ID=$(curl -s -X POST "$BASE_URL/api/word-lists" \
  -H "Content-Type: application/json" \
  -d '{"name":"Connection Test List","description":"Created by verify script"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
echo "Created word list: $LIST_ID"
echo

echo "3) Add a word to it:"
curl -s -X POST "$BASE_URL/api/word-lists/$LIST_ID/words" \
  -H "Content-Type: application/json" \
  -d '{"englishWord":"TEST","phonemes":["t","e","s","t"]}' \
  | python3 -m json.tool
echo

echo "4) Confirm it's readable back from the database:"
curl -s "$BASE_URL/api/word-lists/$LIST_ID" | python3 -m json.tool
echo

echo "Now open $BASE_URL/word-lists in a browser --"
echo "'Connection Test List' with the word TEST should be visible there,"
echo "and it should also appear in the Word list dropdown on $BASE_URL/wordle"
echo "-- proving the frontend is reading live data from the backend/database."
