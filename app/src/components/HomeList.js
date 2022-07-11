import React from 'react';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { FixedSizeList } from 'react-window';

export default function HomeList() {
  const dummyHanlder = (input) => {
    console.log(input);
  };

  function renderRow(props) {
    const { index, style } = props;

    return (
      <ListItem style={style} key={index} component="div" disablePadding>
        <ListItemButton>
          <ListItemText primary={`Item ${index + 1}`} onClick={() => dummyHanlder(`Item ${index + 1}`)} />
        </ListItemButton>
      </ListItem>
    );
  }
  return (
    <Box
      sx={{
        width: '100%', height: 600, maxWidth: 360, bgcolor: 'background.paper',
      }}
    >
      <FixedSizeList
        height={600}
        itemSize={46}
        itemCount={200}
        overscanCount={5}
      >
        {renderRow}
      </FixedSizeList>
    </Box>
  );
}
