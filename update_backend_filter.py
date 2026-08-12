import os
import re

# 1. metrics_service.py
file_path = r'c:\python\policybot\backend\app\observability\metrics_service.py'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace model_filter with provider_filter in get_summary and get_llm_metrics
content = content.replace("model_filter: str = None", "provider_filter: str = None")

# Replace logic in get_summary
old_summary_logic = '''        if model_filter:
            # model_filter can be 'provider / model' format from unique_models_list
            if " / " in model_filter:
                prov, mod = model_filter.split(" / ", 1)
                match_stage["provider"] = prov
                match_stage["model"] = mod
            else:
                match_stage["model"] = model_filter'''
new_summary_logic = '''        if provider_filter:
            match_stage["provider"] = provider_filter'''
content = content.replace(old_summary_logic, new_summary_logic)

# Replace logic in get_llm_metrics
old_metrics_logic = '''        if model_filter:
            if " / " in model_filter:
                prov, mod = model_filter.split(" / ", 1)
                match_stage["provider"] = prov
                match_stage["model"] = mod
            else:
                match_stage["model"] = model_filter'''
new_metrics_logic = '''        if provider_filter:
            match_stage["provider"] = provider_filter'''
content = content.replace(old_metrics_logic, new_metrics_logic)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

# 2. dashboard.py
file_path = r'c:\python\policybot\backend\app\api\v1\dashboard.py'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("model_filter: str = None", "provider_filter: str = None")
content = content.replace("model_filter=model_filter", "provider_filter=provider_filter")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

# 3. metrics.py
file_path = r'c:\python\policybot\backend\app\api\v1\metrics.py'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("model_filter: str = None", "provider_filter: str = None")
content = content.replace("model_filter=model_filter", "provider_filter=provider_filter")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Backend updated.")
