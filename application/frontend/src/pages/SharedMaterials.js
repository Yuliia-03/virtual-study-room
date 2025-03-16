import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect } from 'react';
import { storage } from "../firebase-config";
import { Navigate, useNavigate } from 'react-router-dom';
import { ref, getDownloadURL, uploadBytes, listAll, deleteObject } from "firebase/storage";
import { getAuthenticatedRequest, getAccessToken } from "./utils/authService";
import "../styles/SharedMaterials.css";

function SharedMaterials() {
    const [files, setFiles] = useState([]);
    const [fileModalOpen, setFileModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [roomCode, setRoomCode] = useState(null);

    useEffect(() => {
        const fetchFiles = async () => {
            const data = await getAuthenticatedRequest("/shared_materials/", "GET");
            setRoomCode(data.roomCode);
            const listRef = ref(storage, `shared-materials/${roomCode}/`);
            try {
                const res = await listAll(listRef);
                const filePromises = res.items.map(async (itemRef) => {
                    const fileUrl = await getDownloadURL(itemRef);
                    return { name: itemRef.name, url: fileUrl, type: itemRef.contentType };
                });
                const files = await Promise.all(filePromises);
                setFiles(files);
            }
            catch (error) {
                toast.error("Error Fetching Files");
            }
        };

        fetchFiles();
    }, [roomCode]);

    const handleUploadFile = async (event) => {
        const file = event.target.files[0];
        if (!file) {
            toast.error("No File Selected, Try Again!");
            return;
        }

        const fileExists = files.some(existingFile => existingFile.name === file.name);
        if (fileExists) {
            toast.error("This File Already Exists! Please Rename Your File!");
            event.target.value = "";
            return;
        }

        const fileRef = ref(storage, `shared-materials/${roomCode}/${file.name}`);
        try {
            await uploadBytes(fileRef, file);
            const fileUrl = await getDownloadURL(fileRef);

            setFiles((prevFiles) => [
                ...prevFiles,
                { name: file.name, url: fileUrl, type: file.type }
            ]);

            //clear the previous file to allow same file to be uploaded whilst still triggering onChange
            event.target.value = "";

            toast.success("File Uploaded!");
        }
        catch (error) {
            toast.error("Error Uploading File");
        }
    }

    const handleDeleteFile = async (fileName) => {
        const fileRef = ref(storage, `shared-materials/${roomCode}/${fileName}`);
        try {
            await deleteObject(fileRef);
            setFiles((prevFiles) => prevFiles.filter(file => file.name !== fileName));
            toast.success("File Deleted Successfully!");
        } catch (error) {
            toast.error("Error Deleting File");
        }
    }

    const openFileModal = (file) => {
        setSelectedFile(file);
        setFileModalOpen(true);
    };

    const closeFileModal = () => {
        setFileModalOpen(false);
        setSelectedFile(null);
    };


    return (
        <div className="shared-materials-container">
            <ToastContainer position='top-center'/>
            <div className='shared-materials-content'>
                <h1 className="sm-title">Shared Materials</h1>
                <input type="file" accept=".doc,.docx,.ppt,.pptx,.pdf,image/*" data-testid='upload-materials-button' id='upload-materials' onChange={handleUploadFile} className="upload-materials-button" style={{ display: 'none' }} />
                <label htmlFor="upload-materials" data-testid="plus-upload-button" className="upload-materials-label">+</label>
                <div className='display-files-container'>
                    {files.map((file, index) => (
                        <div key={index} className="file-item">
                            <span onClick={() => openFileModal(file)} style={{ cursor: 'pointer' }} className='file-name-label'>{file.name}</span>
                            <button onClick={() => handleDeleteFile(file.name)} className='file-delete-button' data-testid='material-delete'>&times;</button>
                        </div>
                    ))}
                </div>
                {fileModalOpen && (
                    <div className="file-modal-container">
                        <div className="file-modal-content">
                            <span className="file-close-button" onClick={() => closeFileModal()} style={{ cursor: 'pointer' }} data-testid='modal-materials-close'>&times;</span>
                            <h2 className='file-modal-title'>{selectedFile?.name}</h2>
                            {selectedFile && (
                                <iframe src={selectedFile.url} title={selectedFile.name} className='file-iframe'></iframe>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SharedMaterials;