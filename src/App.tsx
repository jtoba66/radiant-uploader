// src/App.tsx
import React, { useEffect, useRef, useState } from "react";
import "./App.css";

import EachFile from "./components/EachFile";
import Footer from "./components/Footer";

import loading_cat from "./assets/loading_cat.gif";
import loading_cat_smol from "./assets/loading_cat_smol.gif";
import official_logo from "./assets/radiant_official_logo.png";
import upload_icon from "./assets/upload.png";
import folder_icon from "./assets/folder_close.png";
import folder_open from "./assets/folder_open.png";
import john from "./assets/john-travolta.gif";

// serious assets
import serious_folder from "./assets/serious-icons/folder.png";
import serious_upload from "./assets/upload-icon.svg";
import loadingIcon from "./assets/loading.gif";

import {
  connectJackal,
  listFolder,
  createFolders,
  estimateStorage,
  uploadFiles,
  getProviders,
  getBalance,
} from "./jackalV3";

import { getFilesAsync, truncate } from "./utils";

type FileData = { name: string; fid: string };

function App() {
  const [serious, setSerious] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [startup, setStartup] = useState(true);
  const [error, setError] = useState("");

  const [JKLBalance, setJKLBalance] = useState(0);
  const [JKLAddress, setJKLAddress] = useState("");
  const [walletActive, setWalletActive] = useState(false);
  const [noProviders, setNoProviders] = useState(false);

  const [data, setData] = useState<FileData[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [path, setPath] = useState("radiant");
  const [navigation, setNavigation] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [inDropZone, setInDropZone] = useState(false);
  const [cost, setCost] = useState(0);

  const singleFile = useRef<HTMLInputElement | null>(null);
  const loading_icon = serious ? loadingIcon : loading_cat;
  const uploading_icon = serious ? loadingIcon : loading_cat_smol;

  // SSR-safe wallet event listener
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => window.location.reload();
    window.addEventListener("keplr_keystorechange", handler);
    return () => window.removeEventListener("keplr_keystorechange", handler);
  }, []);

  // Update estimated upload cost
  useEffect(() => {
    if (selectedFiles.length === 0) return setCost(0);
    (async () => {
      try {
        const totalBytes = selectedFiles.reduce((acc, f) => acc + f.size, 0);
        const gb = totalBytes / (1024 * 1024 * 1024);
        const jklPrice = await estimateStorage(gb, 365);
        setCost(jklPrice);
      } catch {
        setError("Could not estimate storage cost. Try again later.");
      }
    })();
  }, [selectedFiles]);

  // Initialize wallet connection
  const initWallet = async () => {
    setLoading(true);
    try {
      // ✅ Only pass selectedWallet now
      const { address, balance } = await connectJackal({ selectedWallet: "keplr" });
      setJKLAddress(address);
      setJKLBalance(balance);
      setWalletActive(true);
      await refresh("radiant");
    } catch (err: any) {
      setError(err?.message || "Wallet connection failed.");
    } finally {
      setLoading(false);
    }
  };

  // Refresh on-chain balance
  const refreshBalance = async () => {
    try {
      const balance = await getBalance();
      setJKLBalance(balance);
    } catch {
      console.warn("Could not refresh balance");
    }
  };

  // Load folder contents
  const refresh = async (dir: string) => {
    setLoading(true);
    try {
      const { folders, files } = await listFolder(`s/${dir}`);
      setFolders(folders || []);
      setData((files || []).map((f: string) => ({ name: f, fid: f })));
      setPath(dir);
      setNavigation(dir.split("/").filter(Boolean));
    } catch {
      setError("Could not load folder contents.");
    } finally {
      setLoading(false);
    }
  };

  // Upload and auto-refresh balance
  const handleUpload = async (files: File[]) => {
    if (!walletActive) return setError("Connect your wallet first.");
    if (JKLBalance <= 0) return setError("Not enough JKL tokens.");

    setUploading(true);
    try {
      await uploadFiles(files, false);
      setSelectedFiles([]);
      await refresh(path);
      await refreshBalance();
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const connectButtonClick = async (e: any) => {
    e.target.disabled = true;
    await initWallet();
    await checkAvailableProviders();
    e.target.disabled = false;
  };

  const browseFilesButtonClick = () => singleFile.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files || [];
    setSelectedFiles(Array.from(files).filter((f) => !f.name.includes(".DS_Store")));
  };

  const uploadButtonClick = () => {
    if (JKLBalance < cost) {
      setError("Not enough JKL tokens for upload.");
      return;
    }
    if (selectedFiles.length === 0) return;
    handleUpload(selectedFiles);
  };

  const copyToClipboard = (fileName: string) => {
    const link = `https://jackal.link/p/${JKLAddress}/${path}/${fileName}`;
    navigator.clipboard.writeText(link);
  };

  const openFile = (fileName: string) => {
    const link = `https://jackal.link/p/${JKLAddress}/${path}/${fileName}`;
    const w = window.open(link, "_blank");
    if (w) w.focus();
  };

  const handleDrag = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setInDropZone(false);
    try {
      const files = e.dataTransfer?.files || [];
      setSelectedFiles(Array.from(files).filter((f) => !f.name.includes(".DS_Store")));
    } catch {
      setError("Could not read dropped items.");
    }
  };

  const createMultiFolders = async (names: string[]) => {
    try {
      await createFolders("s/" + path, names);
      await refresh(path);
    } catch {
      setError("Failed to create folder(s).");
    }
  };

  const newFolderClick = async () => {
    const folderName = prompt("New folder name:");
    if (!folderName) return;
    setLoading(true);
    await createMultiFolders([folderName]);
    setLoading(false);
  };

  const backToRootClick = () => refresh("radiant");
  const navigationClick = async (index: number) => {
    const newCrumbs = navigation.slice(0, index + 1);
    await refresh(newCrumbs.join("/") || "radiant");
  };

  const toggleSeriousMode = (() => {
    let clicks = 0;
    return () => {
      clicks++;
      if (clicks === 3) {
        setSerious((prev) => !prev);
        clicks = 0;
      }
    };
  })();

  useEffect(() => {
    if (walletActive) refresh(path);
  }, [walletActive]); // eslint-disable-line

  const checkAvailableProviders = async () => {
    try {
      const providers = await getProviders();
      setNoProviders(!providers || providers.length === 0);
    } catch {
      setNoProviders(true);
    }
  };

  return (
    <div className={"App windows-font " + (serious ? "serious-mode" : "")}>
      {/* startup */}
      {startup && (
        <div className="startup-frame ">
          <div className="title-bar">
            <h2 className="windows-font">Radiant Startup</h2>
          </div>
          <div className="startup-page sick-border frame-page-size">
            <h1>Welcome to Radiant</h1>
            <p>
              <span className="italics">
                Decentralized file publishing — enduring, secure, and truly yours.
              </span>
            </p>
            <ul>
              <li>Your data lives forever on Jackal mainnet.</li>
              <li>One-time JKL payment per upload (no plans).</li>
              <li>Triple-redundant global storage.</li>
            </ul>
            <button className="blue-btn" onClick={() => setStartup(false)}>
              Enter Radiant
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="startup-frame">
          <div className="blocker"></div>
          <div className="title-bar">
            <h2 className="windows-font wallet-header">Error</h2>
          </div>
          <div className="startup-page sick-border">
            <h1 className="wallet-text">Something went wrong</h1>
            <p>{error}</p>
            <button
              className="blue-btn popup-connect-btn"
              onClick={() => setError("")}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* header */}
      <div className="header">
        <div>
          <img alt="Official Radiant Logo" id="logo" src={official_logo} />
          <p id="by-jkl" className="windows-font">
            public storage forever
          </p>
        </div>
        <div className="button-menu">
          {!walletActive ? (
            <span onClick={connectButtonClick} className="button windows-font">
              Connect
            </span>
          ) : (
            <span className="button windows-font" onClick={toggleSeriousMode}>
              {`${JKLAddress.slice(0, 6)}...${JKLAddress.slice(-4)}`}
            </span>
          )}
          <a
            className="button windows-font"
            href="https://astrovault.io/trade/?from=USDC.nobl&to=JKL"
            target="_blank"
            rel="noreferrer"
          >
            Buy JKL
          </a>
          {noProviders && <p style={{ color: "red" }}>Providers not available</p>}
        </div>
      </div>

      {/* body */}
      <div className={"main-body " + (!walletActive ? "blurry" : "")}>
        {/* LEFT */}
        <div
          className={
            inDropZone
              ? "left sick-border drag-drop-zone inside-drag-area"
              : "left sick-border drag-drop-zone"
          }
          onDrop={handleDrop}
          onDragOver={handleDrag}
          onDragEnter={handleDrag}
          onDragLeave={() => setInDropZone(false)}
        >
          {uploading ? (
            <img width={100} alt="uploading..." src={uploading_icon} />
          ) : (
            <>
              {selectedFiles.length > 0 && (
                <>
                  <div className="uploading-queue windows-font">
                    <h4>Uploading queue:</h4>
                    {selectedFiles.map((e, i) => (
                      <li className="windows-font" key={i}>
                        {truncate(e.name, 20)}
                      </li>
                    ))}
                  </div>
                  <button onClick={uploadButtonClick}>Upload</button>
                  <br />
                </>
              )}
              {selectedFiles[0] && (
                <button onClick={() => setSelectedFiles([])}>Clear upload list</button>
              )}
              {selectedFiles.length === 0 && (
                <>
                  {serious ? (
                    <img
                      id="upload-icon"
                      alt="upload icon"
                      width={50}
                      src={serious_upload}
                    />
                  ) : (
                    <img
                      id="upload-icon"
                      alt="upload icon"
                      width={50}
                      src={upload_icon}
                    />
                  )}
                  <p className="windows-font">Drag and drop your file(s) here</p>
                  <button onClick={browseFilesButtonClick}>BROWSE FILES</button>
                </>
              )}
              <span style={{ marginTop: "20px" }} className="windows-font">
                Estimated Upload Cost:{" "}
                <span
                  className={cost === 0 ? "" : "rainbow rainbow_text_animated"}
                >
                  ≈ {cost.toFixed(2)} JKL
                </span>
              </span>
              <input
                type="file"
                ref={singleFile}
                style={{ display: "none" }}
                multiple
                onChange={handleFileChange}
              />
            </>
          )}
        </div>

        {/* RIGHT */}
        <div className="right">
          <div className="nav-bar sick-border">
            <button onClick={backToRootClick}>Root</button>
            {navigation.map((e, i) => (
              <button
                key={i}
                className="navigation"
                onClick={() => navigationClick(i)}
                disabled={i === navigation.length - 1}
              >
                {e}
              </button>
            ))}
          </div>

          <div
            className="title-bar"
            style={{
              display: "flex",
              justifyContent: "space-between",
              margin: "0 10px",
            }}
          >
            <h2 className="windows-font">File Manager</h2>
            <button onClick={newFolderClick}>New folder</button>
          </div>

          <div className="file-manager sick-border">
            {folders.length > 0 && !loading && (
              <div className="folder-container">
                {folders.map((e, i) => (
                  <div key={i} className="each-folder">
                    {serious ? (
                      <img
                        alt="folder"
                        src={serious_folder}
                        width={40}
                        onClick={() => refresh(e)}
                      />
                    ) : (
                      <img
                        alt="folder"
                        src={folder_icon}
                        width={50}
                        onMouseOver={(ev) => (ev.currentTarget.src = folder_open)}
                        onMouseLeave={(ev) => (ev.currentTarget.src = folder_icon)}
                        onClick={() => refresh(e)}
                      />
                    )}
                    <div className="folder-name">{e}</div>
                  </div>
                ))}
              </div>
            )}

            {walletActive && loading && (
              <div className="loading_cat">
                <img
                  alt="cat is loading pls wait"
                  src={loading_icon}
                  width={200}
                />
                <p>Pls hold...</p>
              </div>
            )}

            {!loading && walletActive && data.length === 0 && folders.length === 0 && (
              <div className="john">
                <img alt="john travolta" height="100" src={john} />
                <p>there's nothing here</p>
              </div>
            )}

            {!loading &&
              data.map((e, i) => (
                <EachFile
                  serious={serious}
                  key={i}
                  file={e}
                  copyToClipboard={copyToClipboard}
                  openFile={openFile}
                />
              ))}
          </div>
        </div>
      </div>

      <Footer
        serious={serious}
        walletActive={walletActive}
        connectButtonClick={connectButtonClick}
        JKLBalance={JKLBalance}
        JKLAddress={JKLAddress}
      />
    </div>
  );
}

export default App;
