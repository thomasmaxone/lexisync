import streamlit as st
import importlib

st.set_page_config(page_title="Analysts Nexus", layout="wide")
st.title("Analysts Nexus")

st.sidebar.header("Setup &amp; Options")
show_instructions = st.sidebar.checkbox("Show setup instructions", value=True)

if show_instructions:
    st.info(
        "This repo currently contains an uploaded zip file. Unzip the project into the repository root "
        "so your Python package/modules are importable. Then set PROJECT_MODULE_NAME below to the project's "
        "top-level package or module name. If you prefer, the unzipped files are committed under `analysts-nexus/` "
        "— adjust the import path accordingly or move files to the repo root."
    )

# Update this to match the top-level package/module name from the unzipped project
PROJECT_MODULE_NAME = "analysts_nexus"  # <-- change if needed

def try_import_project(name: str):
    try:
        module = importlib.import_module(name)
        return module
    except Exception:
        return None

project = try_import_project(PROJECT_MODULE_NAME)

if project is None:
    st.warning(
        f"Could not import project module '{PROJECT_MODULE_NAME}'.\n\n"
        "If you haven't unzipped and committed the project files, unzip the uploaded zip into the repo root and commit them.\n"
        "Alternatively, change PROJECT_MODULE_NAME to the correct package or module name in streamlit_app.py."
    )

st.header("Demo / Quick test")

text = st.text_area("Text to analyze", value="Paste or type some text here...", height=200)

col1, col2 = st.columns(2)
with col1:
    if st.button("Run local demo analysis"):
        st.info("Running demo analysis...")
        # Replace demo logic below with your project's call once imported
        if project:
            # Example attempt to call analyze_text — update as needed
            fn = getattr(project, "analyze_text", None)
            if callable(fn):
                try:
                    result = fn(text)
                    st.success("Analysis complete (from project)")
                    st.json(result)
                except Exception as e:
                    st.error(f"Project analyze_text raised: {e}")
            else:
                # fallback demo behavior
                st.warning("Project does not expose analyze_text() — using fallback demo.")
                st.write("Summary (first 300 chars):")
                st.write(text[:300])
                st.write("Length:", len(text))
        else:
            st.write("Summary (first 300 chars):")
            st.write(text[:300])
            st.write("Length:", len(text))

with col2:
    st.write("Upload a file to preview")
    uploaded = st.file_uploader("Upload CSV/JSON/XLSX", type=["csv", "json", "xlsx"])
    if uploaded is not None:
        import pandas as pd
        try:
            if uploaded.name.endswith(".csv"):
                df = pd.read_csv(uploaded)
            elif uploaded.name.endswith(".json"):
                df = pd.read_json(uploaded)
            else:
                df = pd.read_excel(uploaded)
            st.write("Preview of uploaded file:")
            st.dataframe(df.head())
            st.write("Shape:", df.shape)
        except Exception as e:
            st.error(f"Failed to read file: {e}")

st.markdown("---")
st.markdown(
    "If you'd like, I can update PROJECT_MODULE_NAME or move files so the project module is importable."
)
