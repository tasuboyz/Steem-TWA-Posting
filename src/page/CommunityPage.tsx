import React from 'react';
import './CommunityPage.css';
import '../App.css'
import { Telegram } from "@twa-dev/types";
import { Box, List, ListItem, ListItemText, TextField, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const basePath = "/Steem-TWA-Posting";

declare global {
  interface Window {
    Telegram: Telegram;
  }
}

interface Community {
  title: string;
  name: string;
}

function PostingPage() {
  const [communityNames, setCommunityNames] = React.useState<Array<string>>([]);
  const [community, setCommunity] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);
  const navigate = useNavigate();

  const SearchCommunity = React.useCallback(async (): Promise<void> => {
    setLoading(true);
    const headers = {
        "accept": "application/json",
        "Content-Type": "application/json"
    };

    try {
        const response = await fetch(`https://imridd.eu.pythonanywhere.com/api/steem/communities?title=${community}`, {
            method: 'GET',
            headers: headers,
        });

        if (!response.ok) {
            throw new Error('Errore durante l\'invio del messaggio');
        }
        const data = await response.json(); 
        const Communities = data.map((item: Community) => {
          return `${item.name},${item.title}`;
        });
        setCommunityNames(Communities);
        setLoading(false);
    } catch (error) {
        window.Telegram.WebApp.showPopup({
            title: "Errore",
            message: "Si è verificato un errore durante l'invio del messaggio.",
            buttons: [{ type: 'ok' }]
        });
        console.error('Errore durante l\'invio del messaggio:', error);
    }
  }, [community]);

  React.useEffect(() => {
    window.Telegram.WebApp.BackButton.show();

    window.Telegram.WebApp.BackButton.onClick(() => {
      window.Telegram.WebApp.BackButton.hide();
      navigate(`${basePath}/post`);
    });

    SearchCommunity();
    scrollList();
  }, [navigate, SearchCommunity]);

  const scrollList = () => {
    const listElement = document.getElementById('list');
    if (listElement) {
      listElement.scrollBy(0, 100); // Scorre di 100px
    }
  };

  const handleCommunityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCommunity(event.target.value);
    const filteredCommunities = communityNames.filter(name => 
      name.toLowerCase().includes(event.target.value.toLowerCase())
    );
    setCommunityNames(filteredCommunities);
  };

  const handleCommunitySelect = (selectedName: string, selectedId: string) => {
    setCommunity(selectedName);
    localStorage.setItem('steem_selectedCommunityId', selectedId);
    localStorage.setItem('steem_selectedCommunityName', selectedName);
    window.Telegram.WebApp.BackButton.hide();
    navigate(`${basePath}/post`);
  };

  return (
    <div className="container-community">
      <div className="search-container">
        <TextField
          id='community-input' 
          label="Search Community"
          value={community}
          onChange={handleCommunityChange}
          fullWidth
          variant="outlined"
          className="community-search"
        />
      </div>
      <div className="list-container">
        <List id="list">
          <ListItem onClick={() => handleCommunitySelect("No community", "None")}>
            <ListItemText primary="No community" />
          </ListItem>
          {communityNames.map((item, index) => {
          const [id, name] = item.split(',');
          if (communityNames.length === index + 1) {
            return (
              <ListItem key={index} onClick={() => handleCommunitySelect(name, id)}>
                <ListItemText primary={name} />
              </ListItem>
            );
          } else {
            return (
              <ListItem key={index} onClick={() => handleCommunitySelect(name, id)}>
                <ListItemText primary={name} />
              </ListItem>
            );
          }
        })}       
        </List>
        {loading && <Box display="flex" justifyContent="center" my={2}><CircularProgress /></Box>}
      </div>
    </div>
  );
}

export default PostingPage;
