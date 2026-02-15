# Jules Mobile Prototype - System Architecture

```mermaid
graph TB
    %% User Layer
    User[User] --> Login[🔐 LoginScreen]
    User --> Chat[💬 ChatScreen]
    User --> IDE[💻 IDEScreen]
    User --> Terminal[🖥️ TerminalView]

    %% Mobile App Components
    subgraph Mobile App [React Native/Expo]
        App[App.tsx]
        Auth[AuthContext]
        Nav[MainNavigator]
        Login
        Chat
        IDE
        Terminal
        APIMobile[API Service]
    end

    %% Backend Components
    subgraph Backend Server [Node.js/Express]
        Server[Express Server]
        Socket[Socket.io]
        AuthMW[Auth Middleware]
        VMManager[VM Manager]
        SSH[SSH Service]
        Mock[Mock Terminal]
    end

    %% Data Layer
    subgraph Data Store [In-Memory Store]
        Users[Users]
        VMs[VMs]
    end

    %% External Services
    subgraph External [External Services]
        GitHub[GitHub OAuth]
        SSHServers[SSH Servers]
        Cloud[Cloud VM Provider]
    end

    %% Mobile App Connections
    App --> Auth
    Auth --> Nav
    Nav --> Login
    Nav --> Chat
    Nav --> IDE
    IDE --> Terminal
    Login --> APIMobile
    Chat --> APIMobile
    IDE --> APIMobile
    Terminal --> Socket

    %% Backend Connections
    Server --> AuthMW
    AuthMW --> GitHub
    Server --> VMManager
    VMManager --> Users
    VMManager --> VMs
    Socket --> SSH
    SSH --> SSHServers
    SSH --> Mock
    SSH --> Cloud

    %% API Connections
    APIMobile -.->|REST API| Server
    APIMobile -.->|WebSocket| Socket

    %% Data Flow
    Users -.->|User Data| AuthMW
    VMs -.->|VM Config| VMManager
    VMs -.->|Connection Details| SSH

    %% Bidirectional Socket Communication
    Terminal <==> Socket
    Socket <==> SSH
    Socket <==> Mock

    %% Styling
    classDef mobile fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef backend fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef data fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef external fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef user fill:#ffebee,stroke:#b71c1c,stroke-width:2px

    class App,Auth,Nav,Login,Chat,IDE,Terminal,APIMobile mobile
    class Server,Socket,AuthMW,VMManager,SSH,Mock backend
    class Users,VMs data
    class GitHub,SSHServers,Cloud external
    class User user
```

## Architecture Notes

### Mobile App (React Native/Expo)
- **Tech Stack**: TypeScript, React Navigation
- **Components**: Authentication, Chat interface, VM management, Terminal view
- **Communication**: REST API for data, WebSocket for real-time terminal

### Backend Server (Node.js)
- **Tech Stack**: Express.js, Socket.io, SSH2 library
- **Features**: Authentication middleware, VM CRUD operations, SSH connections, Mock terminal
- **Storage**: In-memory data store (prototype)

### Key Features
- **Authentication**: Mock GitHub OAuth
- **VM Management**: Local and Cloud VM support with pricing tiers
- **Terminal**: Real SSH connections via Socket.io or mock terminal for testing
- **Chat**: AI assistant interface (mocked responses)