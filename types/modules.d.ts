declare module 'html-to-docx' {
  interface GenerateOptions {
    table?: {
      row?: {
        cantSplit?: boolean;
      };
    };
    footer?: boolean;
    pageNumber?: boolean;
    header?: boolean;
    orientation?: 'portrait' | 'landscape';
    margins?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
      header?: number;
      footer?: number;
      gutter?: number;
    };
    title?: string;
    subject?: string;
    description?: string;
    keywords?: string[];
    creator?: string;
    lastModifiedBy?: string;
    createdAt?: Date;
    modifiedAt?: Date;
    headerType?: 'default' | 'first' | 'even';
    headerOption?: any;
    footerType?: 'default' | 'first' | 'even';
    footerOption?: any;
    font?: string;
    fontSize?: number;
    complexScriptFontSize?: number;
    tableRowCantSplit?: boolean;
    decodeUnicode?: boolean;
    [key: string]: any;
  }

  function asBlob(
    htmlString: string,
    headerHtmlString?: string | null,
    documentOptions?: GenerateOptions,
    footerHtmlString?: string | null
  ): Promise<Blob | Buffer>;

  export default asBlob;
}
