import { CommentPipe } from './comment.pipe';

describe('CommentPipe', () => {
    let pipe: CommentPipe;

    beforeEach(() => {
        pipe = new CommentPipe();
    });

    it('should create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should return "discuss" when comment count is 0', () => {
        expect(pipe.transform(0)).toBe('discuss');
    });

    it('should return "discuss" when comment count is negative', () => {
        expect(pipe.transform(-5)).toBe('discuss');
    });

    it('should return "1 comment" when comment count is 1', () => {
        expect(pipe.transform(1)).toBe('1 comment');
    });

    it('should return "N comments" when comment count is greater than 1', () => {
        expect(pipe.transform(2)).toBe('2 comments');
        expect(pipe.transform(5)).toBe('5 comments');
        expect(pipe.transform(100)).toBe('100 comments');
    });
});
