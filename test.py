import sys
import json
import requests

url = f"http://localhost:8081/api/latestVersion"

latestVersion = "0.0.1"

try:
  res = requests.get(url, timeout=10)
except:
  print(f"'{url}' not available")
  sys.exit()

if(res.status_code == 200):
  latestVersion = json.loads(res.content)["version"]
else:
  print(f"Response Error: {res.status_code}")


url = f"http://localhost:8081/api/download?v={latestVersion}"

try:
  res = requests.get(url, timeout=10)
except:
  print(f"'{url}' not available")
  sys.exit()

if(res.status_code == 200):
  with open("./DW Piper Setup.exe", "wb") as file:
    file.write(res.content)
else:
  print(f"Response Error: {res.status_code}")

