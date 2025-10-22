import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { DataGrid } from '@mui/x-data-grid';

const columns = [
  {
    field: 'materialTitle',
    headerName: 'Material',
    flex: 1,
    minWidth: 180,
  },
  {
    field: 'overallScore',
    headerName: 'Overall',
    width: 110,
  },
  {
    field: 'fluencyScore',
    headerName: 'Fluency',
    width: 110,
  },
  {
    field: 'accuracyScore',
    headerName: 'Accuracy',
    width: 110,
  },
  {
    field: 'timestamp',
    headerName: 'Recorded At',
    width: 180,
  },
];

function HomeTable({ recordings }) {
  const rows = useMemo(() => recordings.map((record, index) => {
    const evaluation = record?.evaluation || {};
    const scoreSource = evaluation.score_details || evaluation;

    const formatScore = (value) => {
      if (value === null || value === undefined || Number.isNaN(value)) {
        return '--';
      }
      return Number.parseFloat(value).toFixed(1);
    };

    return {
      id: record?.record_id || index,
      materialTitle: record?.material_title || record?.materialId || 'Current material',
      overallScore: formatScore(scoreSource.overall ?? scoreSource.score ?? evaluation.overall),
      fluencyScore: formatScore(scoreSource.fluency ?? scoreSource.fluent ?? evaluation.fluency),
      accuracyScore: formatScore(scoreSource.accuracy ?? scoreSource.pronunciation ?? evaluation.accuracy),
      timestamp: record?.created_at || record?.timestamp || new Date().toLocaleString(),
    };
  }), [recordings]);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSizeOptions={[5, 10]}
        initialState={{
          pagination: { paginationModel: { pageSize: 5 } },
        }}
        disableRowSelectionOnClick
        density="comfortable"
      />
    </div>
  );
}

HomeTable.propTypes = {
  recordings: PropTypes.arrayOf(PropTypes.shape({
    record_id: PropTypes.string,
    evaluation: PropTypes.object,
    material_title: PropTypes.string,
    created_at: PropTypes.string,
    timestamp: PropTypes.string,
  })),
};

HomeTable.defaultProps = {
  recordings: [],
};

export default HomeTable;
