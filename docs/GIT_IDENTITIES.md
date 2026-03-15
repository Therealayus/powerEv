# Git identities and GitHub

## Current setup

| Scope | Email | Name | Where it applies |
|--------|--------|------|-------------------|
| **Global** | ayus.gupta@clavis.digital | Ayush Gupta | All repos except where overridden |
| **This repo (Power Delivery)** | ayushgupta2429@gmail.com | Ayush | Only this folder |

So in **Power Delivery** your commits use **Ayush / ayushgupta2429@gmail.com**. In any other repo (without local config), commits use **Ayush Gupta / ayus.gupta@clavis.digital**.

---

## Switch identity in this repo

Use **Ayush** (already set):
```powershell
cd "d:\Power Delivery"
git config user.email "ayushgupta2429@gmail.com"
git config user.name "Ayush"
```

Use **work** (ayus.gupta@clavis.digital) for this repo only:
```powershell
cd "d:\Power Delivery"
git config user.email "ayus.gupta@clavis.digital"
git config user.name "Ayush Gupta"
```

Check what this repo uses:
```powershell
cd "d:\Power Delivery"
git config user.email
git config user.name
```

---

## Change global identity (all repos)

```powershell
git config --global user.email "ayushgupta2429@gmail.com"
git config --global user.name "Ayush"
# or
git config --global user.email "ayus.gupta@clavis.digital"
git config --global user.name "Ayush Gupta"
```

---

## Connect this repo to GitHub

1. **Create a repo on GitHub** (e.g. `ev-charging` or `Power-Delivery`) with the account you want (e.g. the one that uses ayushgupta2429@gmail.com). Do **not** add a README if you already have local files.

2. **Add the remote and push** (replace `YOUR_USERNAME` and `REPO_NAME`):
   ```powershell
   cd "d:\Power Delivery"
   git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git push -u origin main
   ```

3. **Authentication**
   - **HTTPS:** Git will ask for username and password. For GitHub, use a **Personal Access Token** (Settings → Developer settings → Personal access tokens) instead of your password.
   - **SSH:** If you use SSH keys, use the SSH URL: `git@github.com:YOUR_USERNAME/REPO_NAME.git` and ensure the key is added to the GitHub account you’re pushing to.

To use **two GitHub accounts** (e.g. personal + work): use one account with HTTPS and the other with SSH, or use different remotes with different URLs and credentials.
