# Analysts Nexus — Streamlit wrapper

This branch adds a lightweight Streamlit app entrypoint (streamlit_app.py) that downloads and loads the uploaded project zip at runtime, plus helper files to deploy to Streamlit Cloud.

How to deploy to Streamlit Cloud (fastest):
1. Ensure requirements.txt is present in the repository root (it is in this branch).
2. Go to https://share.streamlit.io and sign in with GitHub.
3. Click New app → select repository `thomasmaxone/lexisync` → branch `add-streamlit-app` → entrypoint `streamlit_app.py` → Deploy.

Notes & next steps:
- The Streamlit entrypoint downloads the uploaded zip from the `main` branch and extracts it at runtime. If you want the app to import a specific package/module from the archive, update streamlit_app.py to point to the correct module or move files accordingly.
- If the archive contains large model/data files (>50 MB), consider hosting those externally or enabling Git LFS. Large files may cause Streamlit Cloud to fail or hit storage limits.
- If additional Python packages are required by the project, add them to requirements.txt.
