﻿using NetTopologySuite.Geometries;
using System.Collections.Generic;
using YaRyadom.Domain.Entities.Base;

namespace YaRyadom.Domain.Entities
{
	public class YaRyadomUser : BaseEntity
	{
		#region Navigation fields

		private ICollection<YaRyadomEvent> _ownYaRyadomEvents;

		private ICollection<YaRyadomUserTheme> _yaRyadomUserThemes;

		private ICollection<YaRyadomUserApplication> _yaRyadomUserApplications;

		private ICollection<YaRyadomReview> _yaRyadomReviewsMine;

		private ICollection<YaRyadomReview> _yaRyadomMyReviewsAboutMe;

		#endregion

		public long VkId { get; set; }

		public bool GuideCompleted { get; set; }

		public string FirstName { get; set; }

		public string LastName { get; set; }

		public string AboutMySelf { get; set; }

		public string VkUserAvatarUrl { get; set; }

		public Point LastLocation { get; set; }

		#region Navigation properties

		public ICollection<YaRyadomEvent> OwnYaRyadomEvents
		{
			get => _ownYaRyadomEvents ?? new List<YaRyadomEvent>();
			set => _ownYaRyadomEvents = value;
		}

		public ICollection<YaRyadomUserTheme> YaRyadomUserThemes
		{
			get => _yaRyadomUserThemes ?? new List<YaRyadomUserTheme>();
			set => _yaRyadomUserThemes = value;
		}
		
		public ICollection<YaRyadomUserApplication> YaRyadomUserApplications
		{
			get => _yaRyadomUserApplications ?? new List<YaRyadomUserApplication>();
			set => _yaRyadomUserApplications = value;
		}

		public ICollection<YaRyadomReview> YaRyadomReviewsMine
		{
			get => _yaRyadomReviewsMine ?? new List<YaRyadomReview>();
			set => _yaRyadomReviewsMine = value;
		}

		public ICollection<YaRyadomReview> YaRyadomReviewsAboutMe
		{
			get => _yaRyadomMyReviewsAboutMe ?? new List<YaRyadomReview>();
			set => _yaRyadomMyReviewsAboutMe = value;
		}

		#endregion
	}
}
