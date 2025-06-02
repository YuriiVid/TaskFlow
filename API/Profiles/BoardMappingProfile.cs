using API.DTOs;
using API.Models;
using AutoMapper;

namespace API.Profiles;

public class BoardMappingProfile : Profile
{
    public BoardMappingProfile()
    {
        CreateMap<Board, FullBoardDto>()
            .ForMember(dest => dest.Columns, opt => opt.MapFrom(src => src.Columns.OrderBy(c => c.Position)))
            .ReverseMap();

        CreateMap<Column, FullColumnDto>()
            .ForMember(dest => dest.Cards, opt => opt.MapFrom(src => src.Cards.OrderBy(card => card.Position)))
            .ReverseMap();

        CreateMap<Board, BriefBoardDto>()
            .ForMember(dest => dest.TasksCount, opt => opt.MapFrom(src => src.Columns.Sum(c => c.Cards.Count)))
            .ForMember(dest => dest.Members, opt => opt.MapFrom(src => src.Members.Select(m => m.User)));

        CreateMap<Card, BriefCardDto>()
            .ForMember(dest => dest.AttachmentsCount, opt => opt.MapFrom(src => src.Attachments.Count))
            .ReverseMap();

        CreateMap<Card, BriefCardDto>()
            .ForMember(dest => dest.CommentsCount, opt => opt.MapFrom(src => src.Comments.Count))
            .ReverseMap();

        CreateMap<Card, BriefCardDto>()
            .ForMember(
                dest => dest.HasDescription,
                opt => opt.MapFrom(src => src.Description != null && src.Description.Trim().Length > 0)
            )
            .ReverseMap();

        CreateMap<Label, LabelDto>().ReverseMap();
        CreateMap<AppUser, UserDto>().ReverseMap();
        CreateMap<Attachment, AttachmentDto>().ReverseMap();
        CreateMap<Comment, CommentDto>().ReverseMap();
        CreateMap<AppUser, BoardMemberDto>().ReverseMap();
        CreateMap<BoardMember, BoardMemberDto>().IncludeMembers(m => m.User).ReverseMap();
        CreateMap<Card, UpdateCardDto>().ReverseMap();
        CreateMap<Card, FullCardDto>().ReverseMap();
    }
}
