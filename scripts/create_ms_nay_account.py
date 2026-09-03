#!/usr/bin/env python3
"""
Buat akun Supabase Auth untuk Ms. Nay dan Ms. Nurul
Jalankan: python scripts/create_ms_nay_account.py

Prasyarat:
- Install requests: pip install requests
- Dapatkan service_role key dari Supabase Dashboard > Project Settings > API > service_role secret
"""

import sys
import requests

SUPABASE_URL = "https://xsbwvdwhdgfbmlnoefkz.supabase.co"
SERVICE_ROLE_KEY = "PASTE_SERVICE_ROLE_KEY_HERE"  # Ganti dengan service role key

COACHES = [
    {
        "email": "ptrinaisya5@gmail.com",
        "password": "nay@digikidz",
        "display_name": "Ms. Nay",
    },
    {
        "email": "nurulaprilianti61@gmail.com",
        "password": "Nurul123456",
        "display_name": "Ms. Nurul",
    },
]

headers = {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
}

if SERVICE_ROLE_KEY == "PASTE_SERVICE_ROLE_KEY_HERE":
    print("ERROR: Ganti SERVICE_ROLE_KEY dengan service role key dari Supabase Dashboard.")
    print("Dashboard > Project Settings > API > service_role secret")
    sys.exit(1)

for coach in COACHES:
    print(f"\nMembuat akun untuk {coach['display_name']} ({coach['email']})...")

    resp = requests.post(
        f"{SUPABASE_URL}/auth/v1/admin/users",
        headers=headers,
        json={
            "email": coach["email"],
            "password": coach["password"],
            "email_confirm": True,
            "user_metadata": {"full_name": coach["display_name"]},
        },
    )

    if resp.status_code == 200:
        user = resp.json()
        user_id = user["id"]
        print(f"  Akun berhasil dibuat. User ID: {user_id}")

        print(f"  Menambahkan role admin...")
        resp2 = requests.post(
            f"{SUPABASE_URL}/rest/v1/user_roles",
            headers=headers,
            json={"user_id": user_id, "role": "admin"},
        )

        if resp2.status_code in (200, 201):
            print(f"  Role admin berhasil ditambahkan.")
        else:
            print(f"  Gagal menambah role: {resp2.status_code} - {resp2.text}")

        print(f"  Selesai: {coach['display_name']} ({coach['email']}) siap digunakan.")
    else:
        print(f"  Gagal membuat akun: {resp.status_code}")
        print(f"  {resp.text}")

print("\n" + "=" * 50)
print("Ringkasan akun yang dibuat:")
for c in COACHES:
    print(f"  {c['display_name']}: {c['email']} / {c['password']}")
print("\nMohon ganti password setelah login pertama.")
