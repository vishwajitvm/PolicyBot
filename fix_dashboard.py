import re

file_path = r'c:\python\policybot\backend\app\api\v1\dashboard.py'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the specific block
old_block = '''        if provider_filter:
            and_conditions.append({"events": {"": {"status": "success", "output_summary.model": model_filter}}})'''
new_block = '''        if provider_filter:
            and_conditions.append({"events": {"": {"status": "success", "output_summary.provider": provider_filter}}})'''
content = content.replace(old_block, new_block)

# Also check for any other 'model_filter' occurrences
content = content.replace("model_filter", "provider_filter")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed dashboard.py")
