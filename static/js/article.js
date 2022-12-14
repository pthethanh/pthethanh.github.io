const article = {
  message: '',
  article: {
    community_id: '',
    article_id: '',
    content: {},
  },
  editor: {},
  init(community_id) {
    this.article.community_id = community_id
    this.initEditor()
  },
  /* create editor dynamically to be able to set existing data in case of edit.*/
  initEditor() {
    let path = window.location.pathname
    if (path === '/blog/new-article') {
      this.editor = createEditor({})
      return
    }
    path = window.location.pathname.substring('blog/articles/'.length + 1)
    let article_id = path.substring(0, path.indexOf('/'))
    fetch('/api/v1/communities/'+this.article.community_id+'/articles/x/' + article_id, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then((response) => response.json())
      .then((data) => {
        this.article = data.article
        this.editor = createEditor(data.article.content)
      })
      .catch((err) => {
        this.message = 'Error: ' + err
      })
  },
  save() {
    this.editor.save().then((content) => {
      for(i = 0; i < content.blocks.length; i++){
        let typ = 'Raw'
        switch(content.blocks[i].type) {
          case 'header':
            typ = 'Header'
            break      
          case 'list':
            typ = 'List'
            break
          case 'embed':
            typ = 'Embed'
            break
          case 'table':
            typ = 'Table'
            break
          case 'responsive_image':
            typ = 'ResponsiveImage'
            break
          case 'raw':
            typ = 'Raw'
            break
          case 'paragraph':
            typ = 'Paragraph'
            break
          case 'image':
            typ = 'Image'
            break
          case 'simpleImage':
            typ = 'SimpleImage'
            break
          case 'quote':
            typ = 'Quote'
            break
          case 'code':
            typ = 'Code'
            break
          case 'delimiter':
            typ = 'Delimiter'
            break
          case 'title':
            typ = 'Title'
            break
          case 'introduction':
            typ = 'Introduction'
            break
          case 'summary':
            typ = 'Summary'
            break
          case 'tag':
            typ = 'Tag'
            break
          case 'keyword':
            typ = 'Keyword'
            break
          case 'nestedList':
            typ = 'NestedList'
            break
          default:
            typ = 'Raw'
            break
        }
        content.blocks[i].data['@type'] = 'type.googleapis.com/article.'+typ
      }
      this.article.content = content
      if (this.article.article_id === '') {
        this.create()
        return
      }
      this.update()
    })
  },
  create() {
    this.message = 'Saving...'
    this.article.status = 1
    fetch('/api/v1/communities/'+this.article.community_id+'/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          article: this.article
        })
      })
      .then((response) => response.json())
      .then((data) => {
        if (data.code) {
          this.message = 'Error: ' + data.message 
          return
        }
        this.message = 'Saved'
        this.article.article_id = data.article_id
        this.article.id = data.id
        window.history.pushState({}, null, '/blog/articles/' + this.article.article_id + '/edit')
      })
      .catch((err) => {
        this.message = 'Error: ' + err
      })
  },
  update() {
    this.message = 'Saving...'
    fetch('/api/v1/communities/'+this.article.community_id+'/articles/' + this.article.id, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          article: {
            article_id: this.article.article_id,
            content: this.article.content,
          },
          update_mask: ['content']
        })
      })
      .then((response) => response.json())
      .then((data) => {
        if (data.code > 0 && data.code != 200) {
          this.message = data.error
          return
        }
        this.message = 'Saved'
      })
      .catch((err) => {
        this.message = 'Error: ' + err
      })
  },
  publish() {
    this.message = 'Publishing...'
    fetch('/api/v1/communities/'+this.article.community_id+'/articles/' + this.article.id, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          article: {
            article_id: this.article.article_id,
            status: 2,
            published_at: new Date()
          },
          update_mask: ['status', 'published_at']
        })
      })
      .then((response) => response.json())
      .then((data) => {
        this.message = 'Published'
      })
      .catch((err) => {
        this.message = 'Error: ' + err
      })
  },
  deleteArticle() {
    this.message = 'Deleting...'
    fetch('/api/v1/communities/'+this.article.community_id+'/articles/' + this.article.id, {
        method: 'DELETE'
      })
      .then((response) => response.json())
      .then((data) => {
        if (data.code > 0 && data.code != 200) {
          this.message = data.error
          return
        }
        this.message = 'Deleted'
      })
      .catch((err) => {
        this.message = 'Error: ' + err
      })
  },
  makePrivate() {
    this.message = 'Updating to private mode...'
    fetch('/api/v1/communities/'+this.article.community_id+'/articles/' + this.article.id, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          article: {
            article_id: this.article.article_id,
            status: 1
          },
          update_mask: ['status']
        })
      })
      .then((response) => response.json())
      .then((data) => {
        this.message = 'Updated'
      })
      .catch((err) => {
        this.message = 'Error: ' + err
      })
  }
}


function createEditor(data) {
  return new EditorJS({
    holder: 'editor',
    autofocus: true,
    placeholder: "Let's write your awesome story!",
    data: data,
    defaultBlock: 'paragraph',
    tools: {
      title:{
        class: Header,
        inlineToolbar: true,
        toolbox: {
          title: 'Title'
        },
        config: {
          placeholder: 'Title',
          levels: [1],
          defaultLevel: 1,
        }
      },
      paragraph: {
        class: Paragraph,
        inlineToolbar: true,
        toolbox: {
          title: 'Text'
        }
      },
      header: {
        class: Header,
        inlineToolbar: true,
        config: {
          placeholder: 'Header',
          levels: [2, 3, 4],
          defaultLevel: 2
        }
      },
      introduction: {
        class: AnyText,
        inlineToolbar: true,
        toolbox: {
          title: 'Introduction'
        },
        config: {
          class: 'edt-introduction'
        }
      },
      tag: {
        class: AnyText,
        inlineToolbar: true,
        toolbox: {
          title: 'Tags'
        },
        config: {
          class: 'edt-tag'
        }
      },
      keyword: {
        class: AnyText,
        inlineToolbar: true,
        toolbox: {
          title: 'Keywords'
        },
        config: {
          class: 'edt-keyword'
        }
      },
      summary: {
        class: AnyText,
        inlineToolbar: true,
        toolbox: {
          title: 'Summary'
        },
        config: {
          class: 'edt-summary'
        }
      },
      Color: {
        class: window.ColorPlugin,
        config: {
          colorCollections: ['#E53E3E', '#F56565', '#FC8181', '#DD6B20', '#ED8936', '#F6AD55', '#D69E2E', '#ECC94B', '#F6E05E', '#38A169', '#48BB78', '#68D391', '#319795', '#38B2AC', '#4FD1C5', '#3182CE', '#4299E1', '#63B3ED', '#5A67D8', '#667EEA', '#7F9CF5', '#805AD5', '#9F7AEA', '#B794F4', '#D53F8C', '#ED64A6', '#F687B3', '#1A202C', '#718096', '#A0AEC0', '#FFFFFF'],
          defaultColor: '#E53E3E',
          type: 'text',
        }
      },
      Marker: {
        class: window.ColorPlugin,
        config: {
          colorCollections: ['#E53E3E', '#F56565', '#FC8181', '#DD6B20', '#ED8936', '#F6AD55', '#D69E2E', '#ECC94B', '#F6E05E', '#38A169', '#48BB78', '#68D391', '#319795', '#38B2AC', '#4FD1C5', '#3182CE', '#4299E1', '#63B3ED', '#5A67D8', '#667EEA', '#7F9CF5', '#805AD5', '#9F7AEA', '#B794F4', '#D53F8C', '#ED64A6', '#F687B3', '#1A202C', '#718096', '#A0AEC0', '#FFFFFF'],
          defaultColor: '#F6E05E',
          type: 'marker',
        }
      },
      nestedList: {
        class: NestedList,
        inlineToolbar: true
      },
      simpleImage: {
        class: SimpleImage,
        inlineToolbar: true
      },
      quote: {
        class: Quote,
        inlineToolbar: true,
        shortcut: 'CMD+SHIFT+O',
        config: {
          quotePlaceholder: 'Enter a quote',
          captionPlaceholder: "Quote's author"
        }
      },
      code: {
        class: CodeTool,
        shortcut: 'CMD+SHIFT+C'
      },
      inlineCode: {
        class: InlineCode,
        shortcut: 'CMD+SHIFT+M'
      },
      delimiter: {
        class: Delimiter,
        inlineToolbar: true
      },
      embed: {
        class: Embed
      },
      raw: RawTool,
      responsive_image: {
        class: AnyTool,
        inlineToolbar: true,
        config: {
          data: {
            src: "mobile.jpg",
            srcset: "mobile.jpg,desktop.jpg",
            caption: "",
          }
        },
        toolbox: {
          title: 'Responsive Images',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`
        }
      },
      table: {
        class: AnyTool,
        inlineToolbar: true,
        config: {
          data: {
            header: ["col1", "col2"],
            content: [
              ["value 1", "value 2"],
              ["value 3", "value 4"],
            ]
          }
        },
        toolbox: {
          title: 'Table',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>`
        }
      }
    }
  })
}