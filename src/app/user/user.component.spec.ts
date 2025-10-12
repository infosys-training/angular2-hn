import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';
import { UserComponent } from './user.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { User } from '../shared/models/user';

describe('UserComponent', () => {
    let component: UserComponent;
    let fixture: ComponentFixture<UserComponent>;
    let mockHackerNewsAPIService: jasmine.SpyObj<HackerNewsAPIService>;
    let mockLocation: jasmine.SpyObj<Location>;
    let mockActivatedRoute: any;

    beforeEach(async () => {
        mockHackerNewsAPIService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchUser']);
        mockLocation = jasmine.createSpyObj('Location', ['back']);

        mockActivatedRoute = {
            params: of({ id: 'testuser' })
        };

        await TestBed.configureTestingModule({
            declarations: [UserComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: mockHackerNewsAPIService },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: Location, useValue: mockLocation }
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(UserComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should fetch user data on ngOnInit', () => {
        const mockUser: User = {
            id: 'testuser',
            karma: 1000,
            about: 'Test user'
        } as User;
        mockHackerNewsAPIService.fetchUser.and.returnValue(of(mockUser));

        component.ngOnInit();

        expect(mockHackerNewsAPIService.fetchUser).toHaveBeenCalledWith('testuser');
        expect(component.user).toEqual(mockUser);
    });

    it('should set error message on API failure', () => {
        mockHackerNewsAPIService.fetchUser.and.returnValue(throwError('Network error'));

        component.ngOnInit();

        expect(component.errorMessage).toBe('Could not load user testuser.');
    });

    it('should call Location.back when goBack is called', () => {
        component.goBack();
        expect(mockLocation.back).toHaveBeenCalled();
    });
});
