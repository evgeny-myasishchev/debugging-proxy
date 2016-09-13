import React, {Component, PropTypes} from 'react'

export default class HttpHeaders extends Component {
  componentWillMount() {}

  render() {
    const { 
      headers
    } = this.props;
    return (
      <table className='table table-sm'>
        <tbody>
          {headers.map((header) => {
            return (<tr>
              <td className="text-xs-right">{header.key}: </td>
              <td>{header.value}</td>
            </tr>)
          })}
        </tbody>
      </table>
    )
  }
}

HttpHeaders.propTypes = {
  headers: PropTypes.array.isRequired
}
