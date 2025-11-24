import streamlit as st
import sys
import os
import tempfile
import zipfile
import shutil
import importlib.util
from pathlib import Path

st.set_page_config(page_title="Analysts Nexus", layout="wide")
st.title("Analysts Nexus — Streamlit Runtime Loader")

RAW_ZIP_URL = "https://raw.githubusercontent.com/thomasmaxone/lexisync/main/analysts-nexus-6eac642a%20(4).zip"

st.sidebar.header("Options")
force_redownload = st.sidebar.button("Redownload & reload project zip")

# Helper: download the zip to a temp dir

def download_zip(url: str, target: Path) -> Path:
    import requests
    r = requests.get(url, stream=True)
    r.raise_for_status()
    with open(target, "wb") as f:
        for chunk in r.iter_content(chunk_size=8192):
            if chunk:
                f.write(chunk)
    return target


# Extract zip and return extraction path

def extract_zip(zip_path: Path, extract_to: Path) -> Path:
    if extract_to.exists():
        shutil.rmtree(extract_to)
    extract_to.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(zip_path, "r") as z:
        z.extractall(extract_to)
    return extract_to


# Find candidate python files that may expose an analyze_text function

def find_candidate_modules(root: Path):
    candidates = []
    for p in root.rglob("*.py"):
        name = p.name.lower()
        if name in ("app.py", "main.py", "analysts_nexus.py", "run.py"):
            candidates.insert(0, p)
        else:
            candidates.append(p)
    return candidates


# Load a module from a file path

def load_module_from_path(path: Path):
    spec = importlib.util.spec_from_file_location(path.stem, str(path))
    if spec is None:
        return None
    mod = importlib.util.module_from_spec(spec)
    try:
        spec.loader.exec_module(mod)  # type: ignore
        return mod
    except Exception as e:
        st.write(f"Failed to load module {path}: {e}")
        return None


# Try to find and call analyze_text function

def try_run_analysis(mod, text: str):
    if not mod:
        return None, "no module"
    for fn_name in ("analyze_text", "analyze", "process", "run"):
        fn = getattr(mod, fn_name, None)
        if callable(fn):
            try:
                return fn(text), None
            except Exception as e:
                return None, f"function {fn_name} raised: {e}"
    return None, "no suitable function found"


# Main loader logic

tmpdir = Path(tempfile.gettempdir()) / "analysts_nexus_streamlit"
zip_path = tmpdir / "analysts_nexus.zip"
extract_path = tmpdir / "extract"

try:
    if force_redownload or not extract_path.exists():
        st.info("Downloading project archive from GitHub...")
        tmpdir.mkdir(parents=True, exist_ok=True)
        download_zip(RAW_ZIP_URL, zip_path)
        extract_zip(zip_path, extract_path)

    st.success(f"Project extracted to {extract_path}")

    candidates = find_candidate_modules(extract_path)
    st.write(f"Found {len(candidates)} Python files in the archive. Trying to load candidates...")

    loaded_modules = []
    for c in candidates[:20]:  # limit attempts
        mod = load_module_from_path(c)
        if mod:
            loaded_modules.append((c, mod))

    if loaded_modules:
        st.write("Loaded modules: ", [str(c) for c, _ in loaded_modules])
    else:
        st.warning("No python modules could be loaded from the archive.")

except Exception as e:
    st.error(f"Failed to download/extract project archive: {e}")
    loaded_modules = []

st.header("Demo / Quick test")
text = st.text_area("Text to analyze", value="Paste or type some text here...", height=200)

if st.button("Run analysis"):
    if not loaded_modules:
        st.info("No project modules loaded — showing fallback summary")
        st.write(text[:1000])
    else:
        # Try to run analysis on first loaded module that contains function
        for c, mod in loaded_modules:
            res, err = try_run_analysis(mod, text)
            if err is None:
                st.success(f"Ran analysis using {c.name}")
                st.json(res)
                break
            else:
                st.write(f"{c.name}: {err}")
        else:
            st.warning("No suitable analysis function found in loaded modules. Showing fallback summary.")
            st.write(text[:1000])

st.markdown("---")
st.write("If the app cannot find a function to run, open the repository and inspect which module exposes a callable like analyze_text(text). Then update the Streamlit UI or the repo structure.")
