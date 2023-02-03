import { makeStyles } from '@mui/styles';
import { Box, InputBase, InputBaseProps, Paper, Popper } from '@mui/material';
import { FC, useCallback, useState } from 'react';
import {
  GridColDef,
  GridRenderEditCellParams,
  useGridApiContext,
} from '@mui/x-data-grid-pro';

import { IColumnType } from '.';
import ViewDataModel from 'features/views/models/ViewDataModel';

type LocalTextViewCell = string;

export default class LocalTextColumnType implements IColumnType {
  cellToString(cell: LocalTextViewCell): string {
    return cell ? cell : '';
  }
  getColDef(): Omit<GridColDef, 'field'> {
    return {
      editable: true,
      renderCell: (params) => <Cell cell={params.value} />,
      renderEditCell: (params) => <EditTextarea {...params} />,
      width: 250,
    };
  }
  processRowUpdate(
    model: ViewDataModel,
    colId: number,
    personId: number,
    data: LocalTextViewCell
  ): void {
    model.setCellValue(personId, colId, data);
  }
}

const useStyles = makeStyles({
  cell: {
    alignItems: 'center',
    display: 'flex',
    height: '100%',
  },
  content: {
    '-webkit-box-orient': 'vertical',
    '-webkit-line-clamp': 2,
    display: '-webkit-box',
    maxHeight: '100%',
    overflow: 'hidden',
    whiteSpace: 'normal',
    width: '100%',
  },
});

const Cell: FC<{ cell: LocalTextViewCell }> = ({ cell }) => {
  const styles = useStyles();

  if (!cell) {
    return null;
  }

  return (
    <Box className={styles.cell}>
      <Box className={styles.content}>{cell}</Box>
    </Box>
  );
};

const EditTextarea = (props: GridRenderEditCellParams<string>) => {
  const { id, field, value, colDef } = props;
  const [valueState, setValueState] = useState(value);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>();
  const apiRef = useGridApiContext();

  const handleRef = useCallback((el: HTMLElement | null) => {
    setAnchorEl(el);
  }, []);

  const handleChange = useCallback<NonNullable<InputBaseProps['onChange']>>(
    (event) => {
      const newValue = event.target.value;
      setValueState(newValue);
      apiRef.current.setEditCellValue(
        { debounceMs: 200, field, id, value: newValue },
        event
      );
    },
    [apiRef, field, id]
  );

  const handleKeyDown = useCallback<NonNullable<InputBaseProps['onKeyDown']>>(
    (event) => {
      if (
        event.key === 'Escape' ||
        (event.key === 'Enter' &&
          !event.shiftKey &&
          (event.ctrlKey || event.metaKey))
      ) {
        const params = apiRef.current.getCellParams(id, field);
        apiRef.current.publishEvent('cellKeyDown', params, event);
      }
    },
    [apiRef, id, field]
  );

  return (
    <div style={{ alignSelf: 'flex-start', position: 'relative' }}>
      <div
        ref={handleRef}
        style={{
          display: 'block',
          height: 1,
          position: 'absolute',
          top: 0,
          width: colDef.computedWidth,
        }}
      />
      {anchorEl && (
        <Popper anchorEl={anchorEl} open placement="bottom-start">
          <Paper elevation={1} sx={{ minWidth: colDef.computedWidth, p: 1 }}>
            <InputBase
              multiline
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              rows={4}
              sx={{ textarea: { resize: 'both' }, width: '100%' }}
              value={valueState}
            />
          </Paper>
        </Popper>
      )}
    </div>
  );
};