import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Paper from '@mui/material/Paper';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import logo from './logo.svg';
import './App.css';
import { useMemo, useState, useCallback, useEffect } from 'react';
import Checkbox from '@mui/material/Checkbox';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import IconButton from '@mui/material/IconButton';
import BackupIcon from '@mui/icons-material/Backup';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Collapse from '@mui/material/Collapse';
import rows from './data';

const defaultTheme = createTheme();
const columns = [
  {
    "id": "column1",
    "ordinalNo": 1,
    "title": "Name",
    "type": "string",
    "width": 600
  },
  {
    "id": "column2",
    "ordinalNo": 2,
    "title": "Age",
    "type": "number",
    "width": 200
  },
  {
    "id": "column3",
    "ordinalNo": 3,
    "title": "Good behaviour",
    "type": "boolean",
    "width": 100
  },
  {
    "id": "column4",
    "ordinalNo": 4,
    "title": "Friends",
    "type": "list",
    "width": 300
  },
]

const columnFilters = {}
for(let c of columns) {
  columnFilters[c.id] = c.type === 'boolean' ? undefined : ''
}
const columnsDisplay = columns.map(c => ({...c, display: true}))

const findById = (array, id) => array.find(item => item.id === id)

const Filter = ({currentFilter, column, update, type}) => {
  const [val, setVal] = useState(currentFilter)
  useEffect(() => {
    setVal(currentFilter)
  }, [currentFilter])
  const renderEditMemo = useMemo(() => {
    if(type === 'boolean') {
      return (
        <Select
          value={val}
          onChange={e => update(column, e.target.value)}
        >
          <MenuItem
            value={undefined}
          >
            All
          </MenuItem>
          <MenuItem
            value={true}
          >
            Yes
          </MenuItem>
          <MenuItem
            value={false}
          >
            No
          </MenuItem>
        </Select>
      )
    } else {
      return (
        <OutlinedInput
          value={val}
          onChange={e => setVal(e.target.value)}
          onBlur={e => update(column, val)}
          type={type === 'number' ? 'number' : 'text'}
          endAdornment={(
            <IconButton color="primary" onClick={e => update(column, val)}>
              <SearchIcon />
            </IconButton>
          )}
        />
      )
    }
  }, [val])
  return renderEditMemo
}

const EditComponent = ({setParent, editing, currentEdit, data, update}) => {
  const [val, setVal] = useState(currentEdit)
  useEffect(() => {
    setVal(currentEdit)
  }, [currentEdit])
  const renderEditMemo = useMemo(() => {
    if(editing.rowId) {
      return (
        <OutlinedInput
          value={val}
          onChange={e => setVal(e.target.value)}
          onBlur={e => setParent(val)}
          type={editing.type === 'number' ? 'number' : 'text'}
          endAdornment={(
            <IconButton color="primary" onClick={e => update(editing.rowId, editing.column, currentEdit, data)}>
              <BackupIcon />
            </IconButton>
          )}
        />
      )
    }
  }, [editing, currentEdit, data, val])
  return renderEditMemo
}

const checkAllProps = (row, search, columns) => {
  if(!isNaN(parseInt(search))) {
    const filtered = Object.keys(row).filter(k => findById(columns, k)?.type === 'number')
    for(let kf of filtered) {
      if(row[kf] === parseInt(search)) {
        return true
      }
    }
    return false
  } else {
    const filtered = Object.keys(row).filter(k => findById(columns, k)?.type === 'list' || findById(columns, k)?.type === 'string')
    for(let kf of filtered) {
      if(row[kf].includes(search)) {
        return true
      }
    }
    return false
  }
}


function App() {
  const [data, setData] = useState( localStorage.getItem('rows') ? JSON.parse(localStorage.getItem('rows')) : rows)
  const [editing, setEditing] = useState({})
  const [currentEdit, setCurrentEdit] = useState('')
  const [filter, setFilter] = useState(columnFilters)
  const [commonSearch, setCommonSearch] = useState('')
  const [columnDisplay, setColumnDisplay] = useState(columnsDisplay)
  const [groupBy, setGroupBy] = useState(false)
  const [collapseOpen, setCollapseOpen] = useState({})
  const updateRow = useCallback((rowId, column, newVal, currentData) => {
    const newData = [...currentData]
    const row = newData.find(r => r.id === rowId)
    if(row) {
      row[column] = newVal
    }
    setData(newData)
    setEditing({})
  }, [])
  const renderEditCell = (data, column, rowId, currentData, curEdit) => {
    return (
      <OutlinedInput
        value={curEdit}
        onChange={e => setCurrentEdit(e.target.value)}
        endAdornment={(
          <IconButton color="primary" onClick={e => {updateRow(rowId, column, currentEdit, currentData)}}>
            <BackupIcon />
          </IconButton>
        )}
      />
    )
  }
  
  const renderCell = useCallback((data, column, rowId, currentData) => {
    switch(column.type) {
      case 'string':
        return <Typography>
          {data}
        </Typography>
      case 'number':
        return <Typography sx={{ fontWeight: 'bold' }}>
          {data}
        </Typography>
      case 'boolean':
        return <Checkbox onChange={e => updateRow(rowId, column.id, e.target.checked, currentData)} checked={data} />
      case 'list':
        return <Select value={data[0]} label="Friends">
          {data.map(f => (
            <MenuItem key={f} value={f}>{f}</MenuItem>
          ))}
        </Select>
    }
  }, [])
  useEffect(() => {
    localStorage.setItem('rows', JSON.stringify(data))
  }, [data])
  useEffect(() => {
    if(editing.value) {
      setCurrentEdit(editing.value)
    }
  }, [editing])
  const updateFilter = useCallback((key, val) => {
    setFilter(f => ({
      ...f,
      [key]: val
    }))
  }, [])
  const onTableCellClick = useCallback((id, key, val, type) => {
    setEditing({
      rowId: id,
      column: key,
      value: val,
      type
    })
  }, [])
  const updateColumnDisplay = useCallback((single, val, arr) => {
    const updated = [...arr]
    const found = updated.find(s => s.id === single.id)
    found.display = val
    setColumnDisplay(updated)
  }, [])
  const isBeingEdited = useCallback((id, key, obj) => obj.rowId === id && obj.column === key)
  const toRender = useMemo(() => {
    const filtered = data.filter(r => {
      let toRet = true
      for(let f of Object.keys(filter)) {
        const colObj = findById(columns, f)
        if(filter[f] !== undefined && filter[f].length !== 0) {
          if(colObj.type === 'string' || colObj.type === 'list') {
            toRet = toRet && r[f].includes(filter[f]) 
          } else if(colObj.type === 'boolean') {
            toRet = toRet && r[f] === filter[f]
          } else if(colObj.type === 'number') {
            toRet = toRet && r[f] === parseInt(filter[f])
          }
        }
        if(!toRet) {
          return false
        }
        if(commonSearch.length) {
          toRet = toRet && checkAllProps(r, commonSearch, columns)
        }
      }
      return toRet
    })
    const grouped = {}
    for(let row of filtered) {
      if(grouped[row[groupBy]]) {
        grouped[row[groupBy]].push(row)
      } else {
        grouped[row[groupBy]] = [row]
      }
    }
    console.log(grouped)
    return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Container component="main" maxWidth="xl" sx={{ mb: 4 }}>
        <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <OutlinedInput
            placeholder="Search across all properties"
            value={commonSearch}
            onChange={e => setCommonSearch(e.target.value)}
            type={'text'}
            sx={{mb: 4}}
          />
          <FormControl>
            <InputLabel style={{marginLeft: '1.5rem'}} id="display-hide-label">Display/hide columns</InputLabel>
            <Select id="display-hide" label='Display/hide columns' labelId='display-hide-label' sx={{marginLeft: 3, minWidth: 300}}>
              {columnDisplay.map(cd => (
                <MenuItem key={cd.id}>
                  <Checkbox checked={cd.display} onChange={e => updateColumnDisplay(cd, e.target.checked, columnDisplay)} />
                  <ListItemText>
                    {cd.title}
                  </ListItemText>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel style={{marginLeft: '1.5rem'}} id="group-by-label">Group by</InputLabel>
            <Select 
              id="group-by"
              label='Display/hide columns'
              labelId='group-by-label' 
              sx={{marginLeft: 3, minWidth: 300}}
              value={groupBy}
              onChange={e => setGroupBy(e.target.value)}
            >
              <MenuItem key={false} value={false}>
                None
              </MenuItem>
              {columns.filter(c => c.type !== 'list').map(cd => (
                <MenuItem key={cd.id} value={cd.id}>
                  {cd.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: '100%' }} aria-label="simple table">
            <TableHead>
              <TableRow>
                {groupBy && (
                  <TableCell /> 
                )}
                <TableCell key="id">ID</TableCell>
                {Object.keys(rows[0]).slice(1).filter(k => findById(columnDisplay, k)?.display).map(k => (
                  <TableCell sx={{width: findById(columns, k)?.width}} key={k}>{findById(columns, k)?.title}</TableCell>
                ))}
              </TableRow>
              <TableRow>
                {groupBy && (
                  <TableCell /> 
                )}
                <TableCell key="id">ID</TableCell>
                {Object.keys(rows[0]).slice(1).filter(k => findById(columnDisplay, k)?.display).map(k => (
                  <TableCell sx={{width: findById(columns, k)?.width}} key={k}>
                    <Filter
                      currentFilter={filter[k]}
                      column={k}
                      update={updateFilter}
                      type={findById(columns, k)?.type}
                    />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            {!groupBy ? (
            <TableBody>
              {filtered.map(row => (
                <TableRow
                  key={row.id}
                >
                  <TableCell key="id">
                    {row.id}
                  </TableCell>
                  {Object.keys(row).slice(1).filter(k => findById(columnDisplay, k)?.display).map(k => (
                    <TableCell key={k} onClick={e => ["string", "number"].includes(findById(columns, k)?.type) && !isBeingEdited(row.id, k, editing) && onTableCellClick(row.id, k, row[k], findById(columns, k)?.type)}>
                      {isBeingEdited(row.id, k, editing) ? 
                        <EditComponent
                          setParent={setCurrentEdit}
                          editing={editing}
                          currentEdit={currentEdit}
                          data={data}
                          update={updateRow}
                        />
                        : 
                        renderCell(row[k], findById(columns, k), row.id, data)
                      }
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
            ) : (
              <TableBody>
                {Object.keys(grouped).map(g => (
                  <>
                    <TableRow>
                      <TableCell>
                        {grouped[g].length > 1 &&
                        <IconButton
                          aria-label="expand row"
                          size="small"
                          onClick={() => collapseOpen[g] ? setCollapseOpen({}) : setCollapseOpen({[g]: true})}
                        >
                          {collapseOpen[g] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                        }
                      </TableCell>
                      <TableCell>
                        {grouped[g][0]?.id}
                      </TableCell>
                      {Object.keys(grouped[g][0]).slice(1).filter(k => findById(columnDisplay, k)?.display).map(k => (
                        <TableCell key={k} onClick={e => ["string", "number"].includes(findById(columns, k)?.type) && !isBeingEdited(grouped[g][0]?.id, k, editing) && onTableCellClick(grouped[g][0]?.id, k, grouped[g][0][k], findById(columns, k)?.type)}>
                          {isBeingEdited(grouped[g][0]?.id, k, editing) ? 
                              <EditComponent
                                setParent={setCurrentEdit}
                                editing={editing}
                                currentEdit={currentEdit}
                                data={data}
                                update={updateRow}
                              />
                              :
                            renderCell(grouped[g][0][k], findById(columns, k), grouped[g][0]?.id, data)
                          }
                        </TableCell>
                      ))}
                    </TableRow>
                    {collapseOpen[g] && grouped[g].slice(1).map(row => (
                      <TableRow
                        key={row.id}
                        style={{backgroundColor: 'rgb(0 0 0 / 24%)'}}
                      >
                        <TableCell />
                        <TableCell key="id">
                          {row.id}
                        </TableCell>
                        {Object.keys(row).slice(1).filter(k => findById(columnDisplay, k)?.display).map(k => (
                          <TableCell key={k} onClick={e => ["string", "number"].includes(findById(columns, k)?.type) && !isBeingEdited(row.id, k, editing) && onTableCellClick(row.id, k, row[k], findById(columns, k)?.type)}>
                            {isBeingEdited(row.id, k, editing) ? 
                              <EditComponent
                                setParent={setCurrentEdit}
                                editing={editing}
                                currentEdit={currentEdit}
                                data={data}
                                update={updateRow}
                              />
                              : 
                              renderCell(row[k], findById(columns, k), row.id, data)
                            }
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </>
                ))}
              </TableBody>
            )}
          </Table>
        </TableContainer>
        </Paper>
      </Container>
    </ThemeProvider>
    )
  }, [data, editing, currentEdit, filter, commonSearch, columnDisplay, groupBy, collapseOpen])
  return toRender;
}

export default App;
