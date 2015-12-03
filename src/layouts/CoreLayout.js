import React from 'react'
import 'styles/core.scss'

export default class CoreLayout extends React.Component {
  render() {
    return (
      <div className="page-container">
        <div className="view-container">
          {this.props.children}
        </div>
      </div>
    )
  }
}

CoreLayout.propTypes = {
  children: React.PropTypes.element
}
