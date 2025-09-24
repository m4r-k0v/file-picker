# Stack AI Google Drive File Picker

A modern, production-ready file picker for Stack AI's Google Drive integration with advanced knowledge base indexing capabilities. Built with Next.js 15, TypeScript, NextAuth.js, Tailwind CSS, and Shadcn UI.

**🚀 Fully integrated with Stack AI's real API endpoints and NextAuth.js authentication!**

## ✨ Features

### 🔐 Authentication & Security
- **NextAuth.js Integration**: Secure, industry-standard authentication
- **Stack AI Credentials Provider**: Login with your Stack AI email/password
- **Session Management**: Persistent authentication across page reloads
- **JWT Security**: Secure token handling and automatic refresh

### 📁 File Management
- **Google Drive Integration**: Seamless connection to your Google Drive through Stack AI
- **File System Navigation**: Browse files and folders like a native file manager
- **Folder Hierarchy**: Navigate through nested folders with breadcrumb navigation
- **File Type Detection**: Smart icons and type detection for various file formats
- **Real-time Updates**: Live status indicators for indexed files and folders

### 🗃️ Knowledge Base Operations
- **Individual File Indexing**: Add single files to your knowledge base
- **Bulk File Operations**: Select multiple files for batch indexing/de-indexing
- **Folder Indexing**: Index entire folders and all their contents
- **Smart Status Detection**: Visual indicators showing indexed status for files and folders
- **Knowledge Base Sync**: Automatic synchronization with Stack AI's indexing system

### 🔍 Advanced UI Features
- **Global Search**: Find files by name across all folders
- **Multi-column Sorting**: Sort by name, date created, date modified, or size
- **Advanced Filtering**: Filter by file type (files/folders) and indexing status
- **Bulk Selection**: Checkbox-based selection for multiple files
- **Responsive Design**: Optimized for desktop and mobile devices
- **Virtualized Lists**: Performance optimization for large file lists (50+ items)

### 🎯 User Experience
- **Loading States**: Visual feedback during operations
- **Error Handling**: Comprehensive error messages and recovery
- **Debug Tools**: Built-in debugging page for troubleshooting
- **Accessibility**: ARIA-compliant components and keyboard navigation

## 🛠️ Tech Stack

### Core Technologies
- **Framework**: Next.js 15 (App Router with Turbopack)
- **Language**: TypeScript with strict type checking
- **Authentication**: NextAuth.js with custom credentials provider
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Shadcn UI with custom theme

### Data & State Management
- **Data Fetching**: Tanstack Query (React Query) v5
- **State Management**: React hooks with optimized re-rendering
- **API Client**: Custom Stack AI client with connection pooling
- **Caching**: Intelligent query caching and invalidation

### Development & Build
- **Build Tool**: Next.js with Turbopack (development) and Webpack (production)
- **Package Manager**: npm with lockfile
- **Icons**: Lucide React icon library
- **Virtualization**: React Window for large lists

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** (recommended: 20+)
- **npm** or **yarn**
- **Stack AI account** with Google Drive connection configured

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/your-org/file-picker.git
cd file-picker
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env.local
```

Edit `.env.local` and add:
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-change-this-in-production
```

4. **Set up Google Drive Connection in Stack AI:**
   - Go to the [Stack AI Workflow builder](https://stack-ai.com)
   - Click on **Knowledge Bases** in the left sidebar
   - Drop the **Google Drive node** on the canvas
   - Click **"Connect to Google Drive"** and complete OAuth authorization

5. **Start the development server:**
```bash
npm run dev
```

6. **Open your browser:**
   - Navigate to [http://localhost:3000](http://localhost:3000) (or the port shown in terminal)
   - Login with your Stack AI credentials
   - Start browsing and indexing your Google Drive files!

## 🔧 Configuration

### NextAuth.js Setup

The application uses NextAuth.js with a custom Stack AI credentials provider. The authentication flow:

1. **User Login** → NextAuth credentials provider
2. **Stack AI Authentication** → Validates with Stack AI Supabase backend  
3. **Session Creation** → JWT with `orgId`, `connectionId`, and `authToken`
4. **Client Sync** → Stack AI client automatically configured with session data

### Environment Variables

Required environment variables:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000  # Your app URL
NEXTAUTH_SECRET=your-secret-key     # Generate with: openssl rand -base64 32

# Stack AI Configuration (automatically configured)
NEXT_PUBLIC_STACK_AI_API_URL=https://api.stack-ai.com
```

## 🏗️ Project Structure

```
src/
├── app/                           # Next.js App Router
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth.js API route
│   │   ├── files/                # Legacy API routes (for reference)
│   │   └── ...
│   ├── dashboard/                # Main dashboard page
│   ├── debug/                    # Debug tools page
│   ├── globals.css               # Global styles & CSS variables
│   ├── layout.tsx                # Root layout with providers
│   └── page.tsx                  # Login page
├── components/
│   ├── auth/                     # Authentication components
│   │   ├── login-form.tsx        # NextAuth login form
│   │   └── login-form-fields.tsx # Form field components
│   ├── dashboard/                # Dashboard components
│   │   └── dashboard-header.tsx  # Header with logout
│   ├── file-picker/              # File picker components
│   │   ├── file-picker.tsx       # Main orchestrator component
│   │   ├── file-list.tsx         # Standard file list
│   │   ├── file-list-virtualized.tsx # Virtualized list for 50+ items
│   │   ├── file-item.tsx         # Individual file/folder item
│   │   ├── file-actions.tsx      # Action buttons (index/delete)
│   │   ├── file-icon.tsx         # File type icons
│   │   ├── file-info.tsx         # File metadata display
│   │   ├── selection-footer.tsx  # Bulk action controls
│   │   ├── toolbar.tsx           # Search/sort/filter controls
│   │   └── ...
│   ├── providers/                # React context providers
│   │   ├── query-provider.tsx    # Tanstack Query provider
│   │   └── session-provider.tsx  # NextAuth session provider
│   └── ui/                       # Shadcn UI base components
├── hooks/                        # Custom React hooks
│   ├── use-nextauth.ts          # NextAuth integration hook
│   ├── use-file-picker.ts       # File picker state management
│   ├── use-stackai-files.ts     # Stack AI API operations
│   └── ...
├── lib/                          # Utilities and clients
│   ├── stackai-client.ts        # Stack AI API client
│   ├── query-keys.ts            # Tanstack Query key factory
│   └── ...
└── types/                       # TypeScript definitions
    ├── api.ts                   # API request/response types
    └── next-auth.d.ts          # NextAuth type extensions
```

## 🎯 Key Components

### Authentication System

#### `useAuth()` Hook
Provides authentication state and actions:
```typescript
const { 
  isAuthenticated, 
  isLoading, 
  session, 
  connectionId, 
  orgId, 
  login, 
  logout 
} = useAuth();
```

#### `LoginForm`
NextAuth-integrated login form with Stack AI credentials provider.

### File Management

#### `FilePicker`
Main orchestrator component that manages:
- File browsing state
- Selection management
- Bulk operations
- API integration

#### `useFilePicker()` Hook
Centralized state management for file operations:
```typescript
const {
  filteredFiles,
  selectedFiles,
  handleBulkIndex,
  handleBulkDeIndex,
  isItemIndexed,
  // ... more state and actions
} = useFilePicker({ onResourceSelection });
```

### Stack AI Integration

#### `StackAIClient`
Comprehensive API client for Stack AI operations:
```typescript
// Authentication
await stackAIClient.authenticate({ email, password });

// File operations
const files = await stackAIClient.listResources({ resource_id: folderId });

// Knowledge base operations
const kb = await stackAIClient.createKnowledgeBase({
  connection_id: connectionId,
  connection_source_ids: [fileId],
  indexing_params: { /* ... */ }
});
```

#### API Hooks
Tanstack Query-powered hooks for data operations:
```typescript
// File operations
const { data: files, isLoading } = useFiles({ folderId });
const { data: indexedFiles } = useIndexedFiles();

// Indexing operations
const indexFile = useIndexFile();
const bulkIndex = useBulkIndexFiles();
const bulkDeIndex = useBulkDeIndexFiles();
```

## 🔄 API Integration

### Stack AI Endpoints

The application integrates with these Stack AI API endpoints:

#### Authentication
- `POST /auth/v1/token` - Supabase authentication
- `GET /organizations/me/current` - Get organization ID

#### Google Drive Operations
- `GET /connections` - List Google Drive connections
- `GET /connections/{id}/resources/children` - List files and folders

#### Knowledge Base Operations
- `POST /knowledge_bases` - Create knowledge base
- `GET /knowledge_bases/sync/trigger/{id}/{org_id}` - Trigger sync
- `GET /knowledge_bases/{id}/resources/children` - List indexed resources
- `DELETE /knowledge_bases/{id}/resources` - Remove resources

### Request/Response Types

All API types are defined in `/src/types/api.ts`:

```typescript
// Stack AI Resource
export type StackAIResource = {
  resource_id: string;
  inode_type: 'file' | 'directory';
  inode_path: { path: string };
  status?: 'pending' | 'indexed' | 'failed';
  // ...
};

// Knowledge Base Creation
export type StackAIKnowledgeBaseCreateRequest = {
  connection_id: string;
  connection_source_ids: string[];
  indexing_params: {
    ocr: boolean;
    unstructured: boolean;
    embedding_params: { embedding_model: string };
    chunker_params: { chunk_size: number; chunk_overlap: number; chunker: string };
  };
};
```

## 🎨 Customization

### Styling & Theme

The application uses a custom light theme inspired by Google Drive:

```css
/* src/app/globals.css */
:root {
  --background: 0 0% 100%;           /* Pure white background */
  --foreground: 222.2 84% 4.9%;      /* Dark text */
  --primary: 221.2 83.2% 53.3%;      /* Blue primary color */
  /* ... more CSS variables */
}
```

### UI Components

Customize Shadcn UI components in `/src/components/ui/`:
- Modify default styles
- Add new component variants
- Extend component APIs

### File Type Detection

Customize file icons and type detection in `/src/components/file-picker/file-icon.tsx`:

```typescript
// Add new file type
if (mimeType.includes('your-type') || fileName.endsWith('.ext')) {
  return <YourIcon className={className} />;
}
```

## 🧪 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint with auto-fix

# Debugging
# Visit http://localhost:3000/debug for authentication debugging
```

### Debug Tools

The application includes a built-in debug page at `/debug`:
- NextAuth session information
- Stack AI client state
- Authentication token status
- Connection and organization IDs

### Adding New Features

1. **Define Types**: Add TypeScript interfaces in `/src/types/api.ts`
2. **API Methods**: Extend `StackAIClient` in `/src/lib/stackai-client.ts`
3. **React Hooks**: Create custom hooks in `/src/hooks/`
4. **UI Components**: Build components in `/src/components/`
5. **Integration**: Connect everything in main components

Example: Adding a new API operation:

```typescript
// 1. Define types
export type NewOperationRequest = {
  param1: string;
  param2: number;
};

// 2. Add client method
async newOperation(params: NewOperationRequest) {
  const response = await fetch(`${BACKEND_URL}/new-endpoint`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${this.authToken}` },
    body: JSON.stringify(params),
  });
  return response.json();
}

// 3. Create hook
export function useNewOperation() {
  return useMutation({
    mutationFn: (params: NewOperationRequest) => 
      stackAIClient.newOperation(params),
  });
}

// 4. Use in component
const newOperation = useNewOperation();
const handleClick = () => newOperation.mutate({ param1: 'value', param2: 123 });
```

## 🚀 Production Deployment

### Build Configuration

1. **Environment Variables:**
```bash
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-production-secret
```

2. **Build and Deploy:**
```bash
npm run build
npm run start
```

### Performance Considerations

- **Virtualized Lists**: Automatically enabled for 50+ items
- **Query Caching**: Intelligent caching with Tanstack Query
- **Image Optimization**: Next.js automatic image optimization
- **Bundle Splitting**: Automatic code splitting with Next.js

### Security Best Practices

- **NextAuth.js**: Industry-standard authentication
- **JWT Security**: Secure token handling
- **CSRF Protection**: Built-in CSRF protection
- **Environment Variables**: Sensitive data in environment variables
- **API Rate Limiting**: Respect Stack AI API rate limits

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Stack AI** for the robust API and Google Drive integration
- **NextAuth.js** for secure authentication
- **Shadcn UI** for beautiful, accessible components
- **Tanstack Query** for powerful data synchronization
- **Vercel** for Next.js and deployment platform