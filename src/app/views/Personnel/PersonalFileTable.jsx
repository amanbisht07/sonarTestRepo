import React, { useEffect, useMemo, useState } from "react";
import Paper from "@material-ui/core/Paper/Paper";
import {
  Fab,
  makeStyles,
  Table,
  TableBody,
  TableContainer,
  TableRow,
  Tooltip,
  Typography,
  IconButton,
  TableHead,
} from "@material-ui/core";
import { loadPFData } from "../../camunda_redux/redux/action";
import { connect, useDispatch } from "react-redux";
import history from "../../../history";
import { changingTableState } from "../../camunda_redux/redux/action/apiTriggers";
import { setRefresh1 } from "../../redux/actions/Refresh1Actions";
import { setSnackbar } from "app/camunda_redux/redux/ducks/snackbar";
import { useTranslation } from "react-i18next";
import Cookies from "js-cookie";
import "./therme-source/material-ui/loading.css";
import AddIcon from "@material-ui/icons/Add";
import PaginationComp from "../utilities/PaginationComp";
import GenericSearch from "../utilities/GenericSearch";
import GenericFilterMenu from "../utilities/GenericFilterMenu";
import { unstable_batchedUpdates } from "react-dom";
import GenericChip from "../utilities/GenericChips";
import _ from "lodash";
import { FiEdit2 } from "react-icons/fi";
import { MRT_ShowHideColumnsButton, MaterialReactTable } from "material-react-table";

const useStyles = makeStyles((theme) => ({
  table: {
    minWidth: "350px",
  },
}));

const FilterOption = [
  {
    value: "Select Field",
    label: "Select Field",
  },
  {
    value: "subject",
    label: "Subject",
  },
  {
    value: "displayFileName",
    label: "File Name",
  },
  // {
  //   value: "status",
  //   label: "Status",
  // },
];
const StatusOption = ["In Progress", "Approved", "Draft", "Rejected", "Return"];

const FilterTypes = {
  type: "select",
  optionValue: FilterOption,
  size: "small",
  variant: "outlined",
  label: "Filter-By",
  color: "primary",
};

const FilterValueTypes = [
  {
    name: "subject",
    type: "text",
    size: "small",
    variant: "outlined",
    label: "Value",
    color: "primary",
  },
  {
    name: "displayFileName",
    type: "text",
    size: "small",
    variant: "outlined",
    label: "Value",
    color: "primary",
  },
  // {
  //   name: "status",
  //   type: "select",
  //   optionValue: StatusOption,
  //   size: "small",
  //   variant: "outlined",
  //   label: "Value",
  //   color: "primary",
  // },
];

const SortValueTypes = [
  {
    name: "subject",
    type: "text",
    size: "small",
    variant: "outlined",
    label: "Subject",
    color: "primary",
  },
  {
    name: "displayFileName",
    type: "text",
    size: "small",
    variant: "outlined",
    label: "File Name",
    color: "primary",
  },
  // {
  //   name: "status",
  //   type: "select",
  //   optionValue: StatusOption,
  //   size: "small",
  //   variant: "outlined",
  //   label: "Status",
  //   color: "primary",
  // },
];

const PersonalFileTable = (props) => {
  const { t } = useTranslation();
  //Initialization of state variables
  const dispatch = useDispatch();
  const [rowData, setRowData] = useState([]);
  const username = localStorage.getItem("username");
  const role = sessionStorage.getItem("role");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSizes] = useState([5, 10, 15]);
  const [Filter, setFilter] = useState({});
  const [SortBy, setSortBy] = useState({});

  const addFilter = (e, type, value) => {
    e.preventDefault();
    let newFilter = { ...Filter };
    if (value) {
      newFilter[`${type}`] = value;
      unstable_batchedUpdates(() => {
        setFilter(newFilter);
        setCurrentPage(0);
        setPageSize(10);
      });
    }
  };

  const deleteChip = (property) => {
    let newFilter = { ...Filter };
    delete newFilter[`${property}`];
    setFilter(newFilter);
  };

  const addSort = (sortObj) => {
    console.log(sortObj);
    setSortBy(sortObj);
  };

  const classes = useStyles();

  const handleClick = (row) => {
    // mtd that has been triggered while row clicks
    if (row !== undefined && row !== "") {
      Cookies.set("paFileId", row.id);
      Cookies.set("paFileName", row.displayFileName);
      history.push({ pathname: "/eoffice/personnel/fileview", state: row.id });
    } else {
      const errorMessage = t("failed_to_load,_kindly_refresh_the_page!");
      callMessageOut(errorMessage);
    }
  };

  const { blnValuePF } = props.subscribeApi; // redux trigger that helps in refreshing table
  useEffect(
    () => loadPFTableData(),
    [
      blnValuePF,
      currentPage,
      pageSize,
      Filter,
      SortBy,
      props.fileSubjectReducer,
    ]
  );

  const loadPFTableData = () => {
    setRowData([]);
    let filter = {};
    Object.entries(Filter).map(([property, value]) => {
      let key = property.split("|")[0];
      filter[`${key}`] = value;
    });
    console.log(filter);
    props.blnEnableLoader(true);
    props
      .loadPFData(username, role, pageSize, currentPage, {
        filter: _.isEmpty(filter) ? null : filter,
        sort: _.isEmpty(SortBy) ? null : SortBy,
      })
      .then((resp) => {
        let tmpArr = [];
        try {
          if (resp.error) {
            callMessageOut(resp.error);
            props.blnEnableLoader(false);
          } else {
            if (resp.data !== undefined) {
              tmpArr = resp.data.map((item, index) => {
                return {
                  ...item,
                  serialNo: pageSize * currentPage + (index + 1),
                };
              });
              setRowData(tmpArr);
              setTotalCount(resp.length != null ? resp.length : 0);
              props.blnEnableLoader(false);
            } else {
              const errorMessage =
                resp.status + " : " + resp.error + " AT " + resp.path;
              callMessageOut(errorMessage);
              props.blnEnableLoader(false);
            }
            props.changingTableState(false, "CHANGE_PA_FILE"); // setting trigger to false as table got updated
            props.setRefresh1(false);
          }
        } catch (e) {
          callMessageOut(e.message);
          props.blnEnableLoader(false);
        }
      })
      .catch((e) => {
        callMessageOut(e.message);
        props.blnEnableLoader(false);
      });
  };

  const callMessageOut = (message) => {
    dispatch(setSnackbar(true, "error", message));
  };

  const CustomToolbarMarkup = ({ table }) => (
    // Custom table header
    <div
      className="PaHeader"
    >
      <div className="PaHeadTop">
        <GenericSearch
          FilterTypes={FilterTypes}
          FilterValueTypes={FilterValueTypes}
          addFilter={addFilter}
          cssCls={{}}
        />
        <div>
          <GenericFilterMenu
            SortValueTypes={SortValueTypes}
            addSort={addSort}
          />
          <div className="PaIconCon">
            <Tooltip title={t("personal_file")}>
              <span>
                <Fab
                  disabled={!props.myInfo}
                  style={{
                    width: "2.2rem",
                    height: ".1rem",
                    backgroundColor: "rgb(230, 81, 71)",
                  }}
                  onClick={() => props.handleClick()}
                >
                  <AddIcon style={{ fontSize: "19", color: "#fff" }} />
                </Fab>
              </span>
            </Tooltip>
          </div>
        </div>
        <MRT_ShowHideColumnsButton table={table} />
      </div>
      <GenericChip Filter={Filter} deleteChip={deleteChip} />
    </div>
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: 'subject',
        header: 'SUBJECT',
        size: 230,
        Cell: ({ cell }) => (
          <span className="text-m">
            {cell.getValue()}
          </span>
        )
      },
      {
        accessorKey: 'displayFileName',
        header: 'FILENAME',
        size: 150,
        Cell: ({ cell }) => (
          <span className="text-m text-b">
            {cell.getValue()}
          </span>
        )
      },
      {
        accessorKey: 'actions',
        header: 'Actions',
        size: 60,
        Cell: ({ cell }) => {
          let row = cell?.row?.original
          return <>
            <div>
              <Tooltip
                title={t("edit_subject")}
                aria-label="Edit Subject"
              >
                <button
                  id="pFile_edit_button"
                  onClick={(e) => {
                    e.stopPropagation();
                    props.handleUpdateSubject(row);
                  }}
                >
                  <FiEdit2 />
                </button>
              </Tooltip>
            </div>
          </>
        }
      },
    ],
    [],
  );

  return (
    <Paper
      elevation={3}
      style={{
        position: "relative",
        borderRadius: "9px",
        // border: `1px solid ${props.theme ? "#727070" : "#c7c7c7"}`,
      }}
    >
      <div>
        <MaterialReactTable
          data={rowData}
          columns={columns}
          displayColumnDefOptions={{
            'mrt-row-numbers': {
              enableResizing: true,
              muiTableHeadCellProps: {
                sx: {
                  fontSize: '1.2rem',
                },
              },
            },
          }}
          enableBottomToolbar={false}
          enableColumnResizing
          enableStickyHeader
          // enableRowSelection
          enableRowNumbers
          enableFilters={false}
          enableFullScreenToggle={false}
          enableDensityToggle={false}
          renderTopToolbar={({ table }) => (
            <CustomToolbarMarkup table={table} />
          )}
          muiTableBodyRowProps={({ row }) => ({
            onClick: () => {
              handleClick(row?.original)
            },
            sx: {
              cursor: 'pointer',
            },
          })}
          muiTableContainerProps={() => ({
            sx: {
              border: "1px solid #8080802b",
              height: "63vh"
            }
          })}
          muiTablePaperProps={() => ({
            sx: {
              padding: "0rem 1rem",
              border: "0",
              boxShadow: "none"
            }
          })}
        // muiTableHeadRowProps={{
        //   sx: {
        //     backgroundColor: "#0000000a"
        //   }
        // }}
        />
      </div>
      <PaginationComp
        pageSize={pageSize}
        pageSizes={pageSizes}
        setCurrentPage={setCurrentPage}
        currentPage={currentPage}
        totalCount={totalCount}
        setPageSize={setPageSize}
      />
    </Paper>
  );
};

function mapStateToProps(state) {
  return {
    props: state.props,
    subscribeApi: state.subscribeApi,
    refreshing: state.refreshing,
    theme: state.theme,
    myInfo: state.myInfo,
    fileSubjectReducer: state.fileSubjectReducer,
  };
}

export default connect(mapStateToProps, {
  setRefresh1,
  loadPFData,
  changingTableState,
})(PersonalFileTable);
