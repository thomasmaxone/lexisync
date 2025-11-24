# Analysts Nexus — Streamlit wrapper

This repository currently contains an uploaded zip file with the Analysts Nexus project. To deploy a Streamlit app:

1. Unzip the uploaded archive into the repository root (locally), e.g.:
   - unzip "analysts-nexus-6eac642a (4).zip" -d analysts-nexus
   - Move or reorganize files so Python packages/modules are importable (project files must be in the repo root or a package directory).

2. Add the Streamlit files (provided in this branch):
   - streamlit_app.py
   - requirements.txt
   - .streamlit/config.toml

3. Edit streamlit_app.py:
   - Set PROJECT_MODULE_NAME to the project's package or module name (so the app can import it).

4. Install and test locally:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate   # Windows: .venv\\Scripts\\activate
   pip install -r requirements.txt
   streamlit run streamlit_app.py
   ```

5. Push to GitHub (if working locally):
   ```bash
   git checkout -b add-streamlit-app
   # Unzip and move project files into repo root, then:
   git add .
   git commit -m "Add Streamlit app and project files"
   git push origin add-streamlit-app
   ```

6. Deploy on Streamlit Cloud:
   - Go to https://share.streamlit.io and sign in with GitHub.
   - New app → select this repository → branch `add-streamlit-app` (or `main`) → entrypoint `streamlit_app.py` → Deploy.

Notes:
- If your project has large model files (>50 MB), use Git LFS or host models externally and download them at runtime.
- If the project's package name differs from the default used in streamlit_app.py (`analysts_nexus`), edit streamlit_app.py and set PROJECT_MODULE_NAME accordingly.
- If you want me to further adapt the app to the project's API, tell me which functions/classes to call and I will update the Streamlit entrypoint.
