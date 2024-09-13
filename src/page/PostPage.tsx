import React from 'react';
import '../App.css'
import { Telegram } from "@twa-dev/types";
import { CommunityButton } from '../components/CommunityButton';
import { useNavigate } from 'react-router-dom';
import './PostPage.css'
import FileInput from '../components/FileInput';
import { postAPI } from './api/postAPI';

const basePath = "/Steem-TWA-Posting";

declare global {
  interface Window {
    Telegram: Telegram;
  }
}
interface Upload {  
  image_base64: string;
  username: string;
  wif:string;
}

function PostPage() {
  const [titolo, setTitolo] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [tag, setTag] = React.useState('inleo');
  const [dateTime, setDateTime] = React.useState('');
  const [communityId, setCommunityId] = React.useState<string | null>(null);
  const [communityName, setCommunityName] = React.useState<string | null>(null);
  const [username, setUsername] = React.useState<string | null>(null);
  const [wif, setWif] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const savedCommunityId = localStorage.getItem('steem_selectedCommunityId');
    const savedCommunityName = localStorage.getItem('steem_selectedCommunityName');
    
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');
    const wif = urlParams.get('wif');
    setWif(wif)
    setUsername(username)

    if (savedCommunityId) {
      setCommunityId(savedCommunityId);
    }
    if (savedCommunityName) {
      setCommunityName(savedCommunityName);
    }
  }, []);

  const inviaMessaggio = (): void => {
    const post = {
        title: titolo,
        description: description,
        tag: tag,
        dateTime: dateTime,
        communityId: communityId
    }
    localStorage.removeItem('steem_title');
    localStorage.removeItem('steem_description');
    window.Telegram.WebApp.sendData(JSON.stringify(post));
  };

React.useEffect(() => {
  const savedTags = localStorage.getItem('steem_tags');
  if (savedTags) {
    setTag(savedTags);
  }
  const savedTitle = localStorage.getItem('steem_title');
  if (savedTitle) {
      setTitolo(savedTitle);
  }
  const savedDescription = localStorage.getItem('steem_description');
  if (savedDescription) {
      setDescription(savedDescription);
  }
  const savedDateTime = localStorage.getItem('dateTime');
    if (savedDateTime) {
      setDateTime(savedDateTime);
  }
}, []);
  
React.useEffect(() => {
    localStorage.setItem('steem_title', titolo);
}, [titolo]);

React.useEffect(() => {
    localStorage.setItem('steem_description', description);
}, [description]);
  
React.useEffect(() => {
  localStorage.setItem('steem_tags', tag);
}, [tag]);

const handleButtonClick = async () => {
  try {
    navigate(`${basePath}/community-page`);
    return
  } catch (error) {
    console.error('Error fetching list:', error);
  }
};

const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      handleSubmit({ image_url: base64String });
    };
    reader.readAsDataURL(file);
  }
};

const handleSubmit = async (data: { image_url: string }) => {  
  if (!username) {
    console.error('username is null');
    return;
  }
  if (!wif) {
    console.error('wif is null');
    return;
  }
  const upload: Upload = {
    image_base64: data.image_url,
    username: username,
    wif: wif
  };

  try 
  {
    setIsLoading(true);
    const response = await postAPI.uploadImage(upload);
    if (response.error) {
      alert(response.error);
      throw new Error(response.error);
    }
    const responseData = response.data;
    const responseString = JSON.stringify(responseData);  
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const urls = responseString.match(urlPattern);
    if (urls && urls.length > 0) {
      let url = urls[0];
      url = url.replace(/["}]+$/, '');
      const png_url = `${url}.png`;   
      setDescription(prevDescription => prevDescription + '\n' + png_url);
    }
  } 
  catch (error) {
    console.error('Errore durante l\'invio dell\'immagine:', error);
  }
  finally {
    setIsLoading(false); // End loading
  }
};

  return (
    <>
      <div className="container">
      {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        )}
      <CommunityButton onClick={handleButtonClick} communityName={communityName || ''} />
      {/* Casella di input per il titolo */}
      <input
        type="text"
        placeholder="Title"
        className="input-title"
        value={titolo}
        onChange={(e) => setTitolo(e.target.value)}
      />
      {/* Casella di input per la descrizione */}
      <textarea
        placeholder="body of post"
        className="input-description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        // onFocus={() => setShowFormatOptions(true)}
        // onBlur={() => setShowFormatOptions(false)}
        maxLength={15000}
      />
      {/* {showFormatOptions && (
          <div className="format-options">
            <button onClick={() => formatSelectedText('bold')}>Bold</button>
            <button onClick={() => formatSelectedText('italic')}>Italic</button>
            <button onClick={() => formatSelectedText('code')}>Code</button>
          </div>
      )} */}
      {/* Casella di input per i tag */}
      <input
        type="text"
        placeholder="Tag exaple: steem steemit steemexclusive"
        className="input-tag"
        value={tag}
        onChange={(e) => {
          const inputWords = e.target.value.split(' ');
          if (inputWords.length <= 7) {
            setTag(e.target.value);
          }
        }}
      />
      <input 
        type="datetime-local" 
        className="input-datetime" 
        value={dateTime} 
        onChange={(e) => setDateTime(e.target.value)} 
      />
      <FileInput onChange={handleFileChange} />
      {/* Bottone di invio post */}
      <button className="button" onClick={inviaMessaggio}>Send Post</button>
    </div>
    </>
  )
}

export default PostPage
