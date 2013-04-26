# State machine as a service

Applications sometimes find themselves managing process flows. These process flows consist of states and inputs that move the process along from one state to another.

For instance, consider a user registration process. When the application creates a new user, that user may start off in a *UNVERIFIED* state. When the application verifies the user's email address, the user may move to a *VERIFIED* state. On the other hand, if sufficient time passes and the user is still in the *UNVERIFIED* state, the application may choose to move the user to a *EXPIRED* state.

Applications with such needs often end up implementing a state machine to manage the process flow. This service aims to save applications from that implementation effort.

Using this service such applications need only define the state machine that reflects the process flow and then tell the service each time a input is made to the process. The service will take care of properly transitioning to the next state in the flow and return that state to the application. The application may also, at any time, ask the service for the current state of a state machine it created. Furthermore, applications may store arbitrary data along with each state.

# Usage
The service is currently provided as a REST API. 

## REST API

### Base URIs
URIs in the rest of this document start with `{baseuri}`. This is a placeholder that should be replaced with one of the URIs below, depending on the environment:

| Environment           | `{baseuri}`                                  |
| --------------------- | -------------------------------------------- |
| Production            | `http://state-machine.herokuapp.com`         |
| Staging (coming soon) | `http://state-machine-staging.herokuapp.com` |
| Development           | `http://localhost:8080`                      |

### Resources

#### State Machines

##### Create a new state machine

###### Request

    POST {baseuri}/v1/state-machines

    {
      "initialState": "foo",
      "states": {
        "foo": {
          "transitions": [
            { "input": "1|2|[a-bA-B]","nextState": "bar" },
            { "input": "3","nextState": "baz" }
          ]
        },
        "bar": {
          "data": "data for state bar",
          "transitions": []
        },
        "baz": {
          "data": "data for state baz"
        }
      }
    }

###### Response (upon successful creation)

    201 Created
    Location: {baseuri}/v1/state-machine/2345

    {
      "meta": {
        "links": {
          "self": "{baseuri}/v1/state-machine/2345"
        }
      }
    }

#### State machine current state

##### Retrieve the current state the state machine is in

###### Request

    GET {baseuri}/v1/state-machine/2345/current-state

###### Response

    303 See Other
    Location: {baseuri}/v1/state-machine/2345/state/1

###### ... after redirection ...

    200 OK

    {
      "meta": {
        "links": {
          "self": "{baseuri}/v1/state-machine/2345/state/1",
          "state-machine": "{baseuri}/v1/state-machine/2345"
        }
      },
      "state": {
        "name": "foo"
      }
    }

#### State machine input

##### Inform the state machine of an input

###### Request

    POST {baseuri}/v1/state-machine/2345/input

    {
      "input": "2"
    }

###### Response (upon successful transition)

    303 See Other
    Location: {baseuri}/v1/state-machine/2345/state/3

###### ... after redirection ...

    200 OK

    {
      "links": {
        "self": "{baseuri}/v1/state-machine/2345/state/3",
        "state-machine": "{baseuri}/v1/state-machine/2345"
      },
      "state": {
        "name": "baz",
        "data": "data for state baz"
      }
    }

# Development Setup (on Mac OS X 10.8)

### First-time setup

1) Download and install [Node.js](http://nodejs.org/).

2) Download, install and start [PostgreSQL server](http://postgresapp.com/).

3) Clone this repository to a folder on your computer. The rest of this document will refer to this folder as `$PROJECT_ROOT`.

4) Install project dependencies.

    cd $PROJECT_ROOT
    npm install

5) Create the database user. When prompted, enter the password as defined in the [`config/default.js`](https://github.com/ycombinator/statemachine/blob/master/config/default.js) file.

    createuser statemachine -P

6) Create the database and make the just-created user its owner.

    createdb statemachine -O statemachine

7) Create the database schema.

    node bin/update_db_schema.js

### Every time you sync $PROJECT_ROOT with the remote GitHub repo

1) Update the project dependencies.

    cd $PROJECT_ROOT
    npm install

2) Update the database schema.

    node bin/update_db_schema.js

### To start the REST API server

1) Start the REST API server.

    cd $PROJECT_ROOT
    node restapi/server.js


