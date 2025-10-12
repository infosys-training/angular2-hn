import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommentComponent } from './comment.component';
import { Comment } from '../../shared/models/comment';

describe('CommentComponent', () => {
    let component: CommentComponent;
    let fixture: ComponentFixture<CommentComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CommentComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize collapse to false on ngOnInit', () => {
        component.ngOnInit();
        expect(component.collapse).toBe(false);
    });

    it('should accept comment input', () => {
        const testComment: Comment = {
            id: 1,
            user: 'testuser',
            content: 'Test comment',
            level: 0,
            time: 123456,
            time_ago: '1 hour ago',
            deleted: false,
            comments: []
        };
        component.comment = testComment;
        expect(component.comment).toEqual(testComment);
    });
});
