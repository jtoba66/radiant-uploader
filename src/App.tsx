import React, { useEffect, useRef, useMemo } from "react";
import { useState } from "react";
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

// ✅ new wrapper imports
import {
  connectJackal,
  listFolder,
  createFolders,
  estimateStorage,
  buyStorage,
  uploadFiles,
  getProviders
} from "./jackalV3";

import { mainnet } from "./config";
import { getFilesAsync, truncate } from "./utils";

type FileData = {
  name: string;
  fid: string;
};

function App() {
  const [serious, setSerious] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [JKLBalance, setJKLBalance] = useState<number>(0);
  const [JKLAddress, setJKLAddress] = useState<string>("");
  const [walletActive, setWalletActive] = useState<boolean>(false);
  const [data, setData] = useState<FileData[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [inDropZone, setInDropZone] = useState<boolean>(false);
  const [path, setPath] = useState<string>("radiant");
  const [navigation, setNavigation] = useState<any>([]);
  const [noProviders, setNoProviders] = useState(false);
  const [cost, setCost] = useState<number>(0);
  const [startup, setStartup] = useState(true);
  const [error, setError] = useState<string>("");

  let loading_icon = serious ? loadingIcon : loading_cat;
  let uploading_icon = serious ? loadingIcon : loading_cat_smol;

  useEffect(() => {
    if (selectedFiles.length > 0) {
      console.log(selectedFiles, "- Has changed");
      updatePrice(selectedFiles);
    }
  }, [selectedFiles]);

  // When user switches wallet
  window.addEventListener("keplr_keystorechange", () => {
    console.log("wallet switched");
    window.location.reload();
  });

  const initWallet = async () => {
    try {
      const { address, balance } = await connectJackal({
        chainId: mainnet.chainId,
        endpoint: mainnet.rpcEndpoint,
        host: mainnet.host,
        selectedWallet: "keplr"
      });

      setJKLAddress(address);
      setJKLBalance(balance / 1_000_000);

      await refresh("radiant");
      setWalletActive(true);
      setLoading(false);
    } catch (err: any) {
      setError(err.toString());
    }
  };

  const updatePrice = async (files: File[]) => {
    if (files.length === 0) {
      setCost(0);
      return;
    }
    let count = files.reduce((acc, f) => acc + f.size, 0);
    let gb = count / (1024 * 1024 * 1024);
    let JKLPrice = await estimateStorage(gb, 365); // one year
    setCost(JKLPrice);
  };

  const refresh = async (dir: string) => {
    setLoading(true);
    const { folders, files } = await listFolder(`s/${dir}`);
    setFolders(folders);
    // v3 returns file names; wrap into {name, fid} for UI
    setData(files.map((f: any) => ({ name: f, fid: f })));
    setLoading(false);
  };

  const handleUpload = async (files: File[]) => {
    if (JKLBalance === 0) {
      alert("You don't have enough JKL");
      return null;
    }
    setUploading(true);
    await uploadFiles(files, false);
    setSelectedFiles([]);
    await refresh(path);
    setUploading(false);
  };

  const connectButtonClick = async (e: any) => {
    e.target.disabled = true;
    await initWallet();
    await checkAvailableProviders();
    e.target.disabled = false;
  };

  const singleFile = useRef<HTMLInputElement | null>(null);

  const browseFilesButtonClick = () => {
    singleFile.current?.click();
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let files = e.target.files || [];
    setSelectedFiles(Array.from(files));
  };
  const uploadButtonClick = () => {
    if (JKLBalance < cost) {
      setError(`Cannot upload files: Not enough JKL tokens`);
      return;
    }
    handleUpload(selectedFiles);
  };

  const openFile = (fileName: string) => {
    const link =
      "https://jackal.link/p/" + JKLAddress + "/" + path + "/" + fileName;
    const w = window.open(link, "_blank");
    if (w) w.focus();
  };

  // Drag n Drop
  const handleDragEnter = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDragLeave = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setInDropZone(false);
  };
  const handleDragOver = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setInDropZone(true);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setInDropZone(false);

    if (e.dataTransfer?.files[0].type === "") {
      let filesAndFolders = await getFilesAsync(e.dataTransfer);
      let selected: File[] = [];
      for (let each in filesAndFolders) {
        let arr = filesAndFolders[each];
        let filter = arr.filter((file) => !file.name.includes(".DS_Store"));
        filter.forEach((e) => selected.push(e));
      }
      setSelectedFiles(selected);
    } else {
      let files = e.dataTransfer?.files || [];
      setSelectedFiles(Array.from(files));
    }
  };

  const createMultiFolders = async (folderNames: string[]) => {
    await createFolders("s/" + path, folderNames);
    await refresh(path);
  };
  const newFolderClick = async () => {
    setLoading(true);
    let folderName = prompt("New folder's name");
    if (folderName) {
      await createMultiFolders([folderName]);
    }
    await refresh(path);
    setLoading(false);
  };

  const backToRootClick = () => {
    refresh("radiant");
  };

  const navigationClick = async (index: number) => {
    let arr = [];
    for (let i = 0; i <= index; i++) {
      arr.push(navigation[i]);
    }
    let newPath = arr.join("/");
    setPath("");
    refresh(newPath);
  };
  const copyToClipboard = (fileName: string) => {
    const link =
      "https://jackal.link/p/" + JKLAddress + "/" + path + "/" + fileName;
    navigator.clipboard.writeText(link);
  };

  let toggleClicks = 0;
  const toggleSeriousMode = () => {
    toggleClicks++;
    if (toggleClicks === 3) {
      setSerious(!serious);
      toggleClicks = 0;
    }
  };

  useMemo(() => {
    if (walletActive) refresh(path);
  }, [walletActive]);

  const checkAvailableProviders = async () => {
    let providers = await getProviders();
    if (!providers || providers.length === 0) {
      setNoProviders(true);
    }
  };

  return (
    <div className={"App windows-font " + (serious ? "serious-mode" : "")}>
      {startup && (
        <div className='startup-frame '>
          <div className='title-bar'>
            <h2 className='windows-font'>Radiant Startup</h2>
          </div>
          <div className='startup-page sick-border frame-page-size'>
            <h1>Welcome to Radiant</h1>
            <p>
              <span className='italics'>
                Decentralized file publishing - enduring, secure, and truly
                yours.
              </span>
            </p>
            <ul>
              <li>
                Using Radiant, your data embarks on a timeless journey,
                safeguarded for two centuries.
              </li>
              <li>Powered by the Jackal Protocol blockchain technology.</li>
              <li>Shareable links provide the path to access.</li>
              <li>
                The Jackal blockchain ensures triple-redundant data safety
                across the globe.
              </li>
              <li>Use JKL tokens to store files forever.</li>
            </ul>
            <p>
              <span className='bold'>Embrace longevity. Embrace Radiant.</span>
            </p>
            <p>
              <span className='small'>
                Please disable your ad-blocker if you have one for the best
                experience.
              </span>
            </p>
            <button className='blue-btn' onClick={(e) => setStartup(false)}>
              Enter Radiant
            </button>
          </div>
        </div>
      )}
      {error.length > 0 && (
        <div className='startup-frame'>
          <div className='blocker'></div>
          <div className='title-bar'>
            <h2 className='windows-font wallet-header'>Error</h2>
          </div>
          <div className='startup-page sick-border'>
            <h1 className='wallet-text'>Something went wrong</h1>
            <p>{error}</p>
            <button
              className='blue-btn popup-connect-btn'
              onClick={(e) => setError("")}
            >
              Close
            </button>
          </div>
        </div>
      )}
      <div className='header'>
        <div>
          <img alt='Official Radiant Logo' id='logo' src={official_logo} />
          <p id='by-jkl' className='windows-font'>
            public storage forever
          </p>
        </div>
        <div className='button-menu'>
          {!walletActive ? (
            <span onClick={connectButtonClick} className='button windows-font'>
              Connect
            </span>
          ) : (
            <span className='button windows-font' onClick={toggleSeriousMode}>
              {`${JKLAddress.slice(0, 6)}...${JKLAddress.slice(-4)}`}
            </span>
          )}
          <a
            className='button windows-font'
            href='https://astrovault.io/trade/?from=USDC.nobl&to=JKL'
            target='_blank'
            rel='noreferrer'
          >
            Buy JKL
          </a>
          {noProviders && (
            <p style={{ color: "red" }}>Providers not available</p>
          )}
        </div>
      </div>
      <div className={"main-body " + (!walletActive ? "blurry" : "")}>
        {/* LEFT */}
        <div
          className={
            inDropZone
              ? "left sick-border drag-drop-zone inside-drag-area"
              : "left sick-border drag-drop-zone"
          }
          onDrop={(e) => handleDrop(e)}
          onDragOver={(e) => handleDragOver(e)}
          onDragEnter={(e) => handleDragEnter(e)}
          onDragLeave={(e) => handleDragLeave(e)}
        >
          {uploading ? (
            <img width={100} alt='uploading...' src={uploading_icon} />
          ) : (
            <>
              {selectedFiles.length > 0 && (
                <>
                  <div className='uploading-queue windows-font'>
                    <h4>Uploading queue:</h4>
                    {selectedFiles.map((e, i) => (
                      <li className='windows-font' key={i}>
                        {truncate(e.name, 20)}
                      </li>
                    ))}
                  </div>
                  <button onClick={uploadButtonClick}>Upload</button>
                  <br />
                </>
              )}
              {selectedFiles[0] && (
                <button
                  onClick={() => {
                    setSelectedFiles([]);
                  }}
                >
                  Clear upload list
                </button>
              )}
              {selectedFiles.length === 0 && (
                <>
                  {serious ? (
                    <img
                      id='upload-icon'
                      alt='upload icon'
                      width={50}
                      src={serious_upload}
                    />
                  ) : (
                    <img
                      id='upload-icon'
                      alt='upload icon'
                      width={50}
                      src={upload_icon}
                    />
                  )}
                  <p className='windows-font'>Drag and drop your file(s) here</p>
                  <p></p>
                  <button onClick={browseFilesButtonClick}>BROWSE FILES</button>
                </>
              )}
              <span style={{ marginTop: "20px" }} className='windows-font'>
                Upload Cost:{" "}
                <span
                  className={cost === 0 ? "" : "rainbow rainbow_text_animated"}
                >
                  {cost.toFixed(2)} JKL
                </span>
              </span>
              <input
                type='file'
                id='file'
                ref={singleFile}
                style={{ display: "none" }}
                multiple
                onChange={handleFileChange}
              />
            </>
          )}
        </div>

        {/* RIGHT */}
        <div className='right'>
          <div className='nav-bar sick-border'>
            <button onClick={backToRootClick}>Root</button>
            {navigation.map((e: any, i: any) => {
              if (i === navigation.length - 1) {
                return (
                  <button className='navigation' key={i} disabled>
                    {e}
                  </button>
                );
              }
              return (
                <button
                  className='navigation'
                  onClick={(e) => navigationClick(i)}
                  key={i}
                >
                  {e}
                </button>
              );
            })}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              margin: "0 10px",
            }}
            className='title-bar'
          >
            <h2 className='windows-font'>File Manager</h2>
            <button onClick={newFolderClick}>New folder</button>
          </div>
          <div className={"file-manager sick-border "}>
            {folders.length !== 0 && !loading && (
              <div className='folder-container'>
                {folders &&
                  folders.map((e, i) => (
                    <div key={i} className='each-folder'>
                      {serious ? (
                        <img
                          alt='folder'
                          src={serious_folder}
                          width={40}
                          onClick={() => refresh(e)}
                        />
                      ) : (
                        <img
                          alt='folder'
                          src={folder_icon}
                          width={50}
                          onMouseOver={(e) =>
                            (e.currentTarget.src = folder_open)
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.src = folder_icon)
                          }
                          onClick={() => refresh(e)}
                        />
                      )}
                      <div className='folder-name'>{e}</div>
                    </div>
                  ))}
              </div>
            )}
            {walletActive && loading && (
              <div className='loading_cat'>
                <img
                  alt='cat is loading pls wait'
                  src={loading_icon}
                  width={200}
                />
                <p>Pls hold...</p>
              </div>
            )}

            {!loading && walletActive && data.length === 0 && folders.length === 0 && (
              <div className='john'>
                <img alt='john travolta' height='100' src={john} />
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
