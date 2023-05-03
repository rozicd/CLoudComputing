import React, { useState } from 'react';
import { Auth, Storage } from 'aws-amplify';

function Home() {
    const [selectedFile, setSelectedFile] = useState(null);

    const handleSignOut = async () => {
        try {
            await Auth.signOut();
            window.location.reload();
        } catch (error) {
            console.log('Error signing out:', error);
        }
    };

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleFileUpload = async () => {
        if (!selectedFile) {
            alert('Please select a file');
            return;
        }

        try {
            const filename = selectedFile.name;
            const result = await Storage.put(filename, selectedFile);
            console.log('Uploaded file:', result.key);
            alert('File uploaded successfully');
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading file');
        }
    };

    return (
        <div>
            <h1>Welcome to the Home Page!</h1>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleFileUpload}>Upload</button>
            <button onClick={handleSignOut}>Sign Out</button>
        </div>
    );
}

export default Home;
