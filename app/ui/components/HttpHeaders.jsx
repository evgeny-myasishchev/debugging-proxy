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
            return (<tr key={header.key}>
              <td style={{whiteSpace: 'nowrap'}} className="text-xs-right">
                <small>{header.key}: </small>
              </td>
              <td style={{width: '100%'}}>
                <small>{header.value}</small>
              </td>
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
