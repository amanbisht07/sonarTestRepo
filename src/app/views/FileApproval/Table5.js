import React from 'react';
import Paper from '@material-ui/core/Paper';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { withStyles } from '@material-ui/core/styles';



 // const TableNoDataCell = ({colSpan }) => {
  //  return (
   //  <td colSpan={colSpan} style={{textAlign:"center",height:"200px",color:"blue"}}>
   //   Please Add Noting
      
        
    //  </td>
   // );
 // };
 const styles = theme => ({
  tableStriped: {
    '& tbody tr:nth-of-type(odd)': {
      backgroundColor:'white'
    },
    '& tbody tr:nth-of-type(even)': {
      backgroundColor: 'white'
    },
  },
 
});
const TableComponentBase = ({ classes, ...restProps }) => (
  <h4>hello</h4>
);
export const TableComponent = withStyles(styles, { name: 'TableComponent' })(TableComponentBase);

class Table5 extends React.Component{
 state={
   columns : [
    { name: 'file', title: 'FLAG' }
   
  ],
   rows : [{file:"Demo1.docx" },
  {file:"Demo2.docx" },
  {file:"Demo3.docx" },
  ],
 };
 TableRow = ({ row, ...restProps }) => {
  return (
    <h4>hello</h4>
  );
};
  
render(){
  const { rows, columns } = this.state;
 
  return(
   
  <Paper>
    <h4>hello</h4>
  </Paper>
);
}
}
export default Table5;
  
  
  
  
  
  
  
  
  
  
  
  
