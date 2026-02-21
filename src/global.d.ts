import 'react';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'emoji-picker': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            'emoji-category-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
                name?: string;
            }, HTMLElement>;
        }
    }
}

export {};








