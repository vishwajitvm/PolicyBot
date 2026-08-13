import os

# 1. dashboard.api.ts
file_path = r'c:\python\policybot\frontend\src\api\dashboard.api.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("model_filter?: string", "provider_filter?: string")
content = content.replace("model_filter", "provider_filter")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

# 2. metrics.api.ts
file_path = r'c:\python\policybot\frontend\src\api\metrics.api.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("model_filter?: string", "provider_filter?: string")
content = content.replace("model_filter", "provider_filter")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Frontend APIs updated.")
