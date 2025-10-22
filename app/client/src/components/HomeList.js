import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';

export default function HomeList({ materials, onSelect, selectedId }) {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        bgcolor: 'background.paper',
        borderRadius: 2,
        overflowY: 'auto',
      }}
    >
      <List disablePadding>
        {materials.map((material) => {
          const isSelected = material.id === selectedId;

          return (
            <ListItem
              key={material.id}
              disablePadding
              secondaryAction={(
                <Chip
                  label={`Level ${material.level}`}
                  size="small"
                  color={material.level <= 2 ? 'success' : material.level <= 4 ? 'warning' : 'error'}
                />
              )}
            >
              <ListItemButton
                selected={isSelected}
                onClick={() => onSelect(material.id)}
              >
                <ListItemText
                  primary={material.title}
                  secondary={`${material.length.toFixed(1)}s`}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}

HomeList.propTypes = {
  materials: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    length: PropTypes.number,
    level: PropTypes.number,
  })),
  onSelect: PropTypes.func,
  selectedId: PropTypes.string,
};

HomeList.defaultProps = {
  materials: [],
  onSelect: () => {},
  selectedId: null,
};
