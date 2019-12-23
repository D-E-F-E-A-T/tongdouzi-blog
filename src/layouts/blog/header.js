import React from 'react'
import { Link } from 'gatsby'
import styled from 'styled-components'

const Containner = styled.header`
  position: relative;
  color: #fff;
  background-color: transparent;
`

const Inner = styled.div`
  margin: 0 auto;
  max-width: 1040px;
  width: 100%;
  height: 40px;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
`

const Nav = styled.ul`
  list-style: none;
  margin: 0;
  display: flex;
`

const NavItem = styled.li`
  margin: 0;
  font-size: 15px;
  line-height: 18px;
  overflow: visible;
  > a {
    display: block;
    margin: 0 4px;
    padding: 5px 10px;
    border-radius: 5px;
    color: #fff;
    text-decoration: none;
    opacity: .8;
    transition: all ease 0.2s;
    :hover {
      text-decoration: none;
      opacity: 1;
      box-shadow: 0px 0px 20px #444;
    }
  }
}
`

// const Contact = styled.ul`
//   list-style: none;
//   margin: 0;
//   display: flex;
// `

// const ContactItem = styled.li`
//   margin: 0;
// `

export default function ({ siteTitle }) {
  return (
    <Containner>
      <Inner>
        <Nav>
          <NavItem>
            <Link to="/">博客</Link>
          </NavItem>
          {/* <NavItem>
            <Link to="/welcome/">画廊</Link>
          </NavItem> */}
          <NavItem>
            <Link to="/resume">关于我</Link>
          </NavItem>
        </Nav>
        {/* <Contact>
              <ContactItem>呵呵</ContactItem>
              <ContactItem>呵呵</ContactItem>
            </Contact> */}
      </Inner>
    </Containner>
  )
}

