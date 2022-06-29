import * as React from 'react';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';

function handleClick(event) {
  event.preventDefault();
  console.info('You clicked a breadcrumb.');
}

export default function HomeNavigation() {
  return (
    <div role="presentation" onClick={handleClick}>
      <Breadcrumbs aria-label="breadcrumb">
        <Link
          underline="hover"
          color="inherit"
          href="/"
        >
          Home
        </Link>
        <Link
          aria-disabled
          underline="hover"
          color="inherit"
          href="/"
        >
          Products
        </Link>
        <Link
          aria-disabled
          underline="hover"
          color="inherit"
          href="/"
        >
          Company
        </Link>
        <Link
          aria-disabled
          underline="hover"
          color="inherit"
          href="/"
        >
          Blog
        </Link>
      </Breadcrumbs>
    </div>
  );
}
