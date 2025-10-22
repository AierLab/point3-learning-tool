import React from 'react';
import PropTypes from 'prop-types';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

function HomeNavigation({ currentMaterial }) {
  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      aria-label="learning progress"
    >
      <Chip label="Select" color="primary" variant="outlined" />
      <Chip label="Listen" color={currentMaterial ? 'primary' : 'default'} variant="outlined" />
      <Chip label="Record" variant="outlined" />
      <Typography color="text.primary">
        {currentMaterial?.title || 'Waiting for selection'}
      </Typography>
    </Breadcrumbs>
  );
}

HomeNavigation.propTypes = {
  currentMaterial: PropTypes.shape({
    title: PropTypes.string,
  }),
};

HomeNavigation.defaultProps = {
  currentMaterial: null,
};

export default HomeNavigation;
